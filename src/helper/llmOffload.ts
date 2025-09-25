import { Document } from './../entity/Document';
import dotenv from 'dotenv';
dotenv.config({ path: '../.env' });
import { logger } from '../utils/logger';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { uploadFileToS3Path } from './fileUpload';

export const createEmbedding = async (
  document: Document,
  isAIDoc: boolean,
  req: Request | any,
) => {
  try {
    const response = await axios.post(
      `${process.env.EMBEDDING_URL}`,
      {
        document,
        isAIDoc,
      },
      {
        headers: {
          Authorization: `Bearer ${req.headers.token}`,
        },
      },
    );
    return response;
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return { status: 500, message: error.message };
  }
};

export const createListEmbedding = async (url: any, req: Request | any) => {
  try {
    const response = await axios.post(
      `${process.env.EMBEDDING_URL}-list`,
      {
        url,
      },
      {
        headers: {
          Authorization: `Bearer ${req.headers.token}`,
        },
      },
    );
    return response;
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return { status: 500, message: error.message };
  }
};

export const deleteEmbedding = async (document: any, req: Request | any) => {
  try {
    const response = await axios.delete(`${process.env.DELETE_EMBEDDING_URL}`, {
      data: {
        document,
      },
      headers: {
        Authorization: `Bearer ${req.headers.token}`,
      },
    });
    return response;
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return { status: 500, message: error.message };
  }
};

export const attachDocument = async (
  document: { documentFileUrl: string },
  aiText: string,
) => {
  try {
    const fileURL = document?.documentFileUrl;
    if (!fileURL) {
      return { status: 400, message: 'Document URL is required' };
    }

    const fileName = path.basename(fileURL) || 'downloaded_file';
    const filePath = path.resolve(__dirname, '../../uploads/', fileName);

    const response = await axios.get(fileURL, { responseType: 'stream' });

    const uploadDir = path.resolve(__dirname, '../../uploads/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileStream = fs.createWriteStream(filePath);

    response.data.pipe(fileStream);
    function wrapText(
      text: string,
      font: any,
      fontSize: number,
      maxWidth: number,
    ) {
      const words = text.split(' ');
      const lines = [];
      let currentLine = '';

      for (const word of words) {
        const testLine =
          currentLine.length > 0 ? `${currentLine} ${word}` : word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        if (width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine.length > 0) lines.push(currentLine);

      return lines;
    }

    return new Promise((resolve, reject) => {
      fileStream.on('finish', async () => {
        if (filePath.endsWith('.pdf')) {
          try {
            const existingPdfBytes = fs.readFileSync(filePath);
            const pdfDoc = await PDFDocument.load(existingPdfBytes);

            let newPage = pdfDoc.addPage();
            const { height } = newPage.getSize();

            const fontSize = 12;
            const lineHeight = fontSize + 6;
            let y = height - 50;

            const parsedText = JSON.parse(aiText);

            if (!Array.isArray(parsedText)) {
              throw new Error('AI text must be an array of clauses.');
            }

            parsedText.forEach(async ({ clause, details }) => {
              newPage.drawText(`Clause: ${clause}`, {
                x: 50,
                y,
                size: fontSize,
                color: rgb(0, 0, 0),
              });
              y -= lineHeight;
              const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
              const pageWidth = newPage.getWidth();

              const detailLines = details.split('\n');
              for (const line of detailLines) {
                const wrappedLines = wrapText(
                  line.trim(),
                  font,
                  fontSize - 1,
                  pageWidth - 80,
                );
                for (const wrappedLine of wrappedLines) {
                  newPage.drawText(wrappedLine, {
                    x: 60,
                    y,
                    size: fontSize - 1,
                    color: rgb(0.2, 0.2, 0.2),
                  });
                  y -= lineHeight;

                  if (y < 50) {
                    const nextPage = pdfDoc.addPage();
                    y = nextPage.getHeight() - 50;
                    newPage = nextPage;
                  }
                }
              }

              y -= lineHeight;
            });

            const pdfBytes = await pdfDoc.save();
            fs.writeFileSync(filePath, pdfBytes);
          } catch (error: any) {
            logger.log({
              level: 'error',
              message: `Error processing PDF: ${error.message}`,
            });
            return reject({
              status: 500,
              message: 'Error appending AI text to the PDF',
            });
          }
        } else if (filePath.endsWith('.docx')) {
          try {
            const content = fs.readFileSync(filePath, 'binary');
            const zip = new PizZip(content);
            const doc = new Docxtemplater(zip, {
              paragraphLoop: true,
              linebreaks: true,
            });

            doc.render();

            const paragraphXml = `
              <w:p>
                <w:r>
                  <w:t>${aiText}</w:t>
                </w:r>
              </w:p>
            `;

            const docXml = zip.file('word/document.xml')?.asText();
            if (docXml) {
              const updatedXml = docXml.replace(
                '</w:body>',
                `${paragraphXml}</w:body>`,
              );
              zip.file('word/document.xml', updatedXml);
            }

            const updatedContent = zip.generate({ type: 'nodebuffer' });
            fs.writeFileSync(filePath, updatedContent);
          } catch (error: any) {
            logger.log({
              level: 'error',
              message: `Error processing Word document: ${error.message}`,
            });
            return reject({
              status: 500,
              message: 'Error appending AI text to the Word document',
            });
          }
        }

        const uploadResult = await uploadFileToS3Path(filePath);

        if (uploadResult.status !== 200) {
          return reject({ status: 500, message: 'Error saving the document' });
        }

        resolve({
          status: 200,
          message: 'Document attached successfully',
          data: {
            filePath,
            aiText,
            documentFileUrl: uploadResult.message,
          },
        });
      });

      fileStream.on('error', (err) => {
        logger.log({
          level: 'error',
          message: `File stream error: ${err.message}`,
        });
        reject({ status: 500, message: 'Error saving the document' });
      });
    });
  } catch (error: any) {
    logger.log({
      level: 'error',
      message: error.message,
    });
    return { status: 500, message: 'Internal Server Error' };
  }
};
