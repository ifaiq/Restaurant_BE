import PDFDocument from 'pdfkit';
import { Document } from '../entity/Document';

function generateDocListPDF(documentData: { data: any }) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(20)
      .text('Document List', { align: 'center', underline: true });
    doc.moveDown();

    const documents = documentData.data;

    documents.forEach((data: Document, index: number) => {
      if (index > 0) doc.addPage();
      doc.fontSize(16).text(`Document #${index + 1}`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(12).text(`Title: ${data.documentTitle}`);
      doc.text(`Brief: ${data.documentBrief}`);
      doc.text(`Version: ${data.documentVersion}`);
      doc.text(`Approval Status: ${data.ApprovalStatus}`);
      doc.text(`Published: ${data.isPublished}`);
      doc.text(`Pending: ${data.isPending}`);
      doc.text(`AI Friendly: ${data.aiFriendlyStatus}`);
      doc.text(`File URL: ${data.documentFileUrl}`);
      doc.text(`Author(s): ${data.documentAuthor.join(', ')}`);
      doc.moveDown();

      doc.fontSize(14).text('Created By', { underline: true });
      doc.fontSize(12).text(`Name: ${data.createdBy?.name || '-'}`);
      doc.text(`Email: ${data.createdBy?.email || '-'}`);
      doc.text(`Role: ${data.createdBy?.roleName || '-'}`);
      doc.text(`Created At: ${data.createdAt}`);
      doc.moveDown();

      doc.fontSize(14).text('Company Info', { underline: true });
      doc.fontSize(12).text(`Company: ${data.company?.companyName || '-'}`);
      doc.text(`Type: ${data.company?.companyType || '-'}`);
      doc.moveDown();

      doc.fontSize(14).text('Department Info', { underline: true });
      doc
        .fontSize(12)
        .text(`Department: ${data.department?.departmentName || '-'}`);
      doc.moveDown();
    });

    doc.end();
  });
}

function generateCompanyPDF(companyPayload: { data: any }) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: any = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const childCompanies = companyPayload.data;
    doc.fontSize(20).text('Company List', { align: 'center', underline: true });
    if (Array.isArray(childCompanies) && childCompanies.length > 0) {
      childCompanies.forEach((child, index) => {
        if (index > 0) doc.addPage();
        doc.fontSize(16).text(`Company #${index + 1}`, { underline: true });
        doc.moveDown(0.5);
        addCompanyDetails(doc, child);

        if (child.parentId) {
          doc.moveDown();
          doc
            .fontSize(14)
            .text('Parent of This Child Company', { underline: true });
          doc.moveDown(0.5);
          addCompanyDetails(doc, child.parentId);
        }
      });
    }

    doc.end();
  });
}

function addCompanyDetails(doc: any, company: any) {
  const lines = [
    `Company Name: ${company?.companyName || '-'}`,
    `Abbreviation: ${company?.abbreviation || '-'}`,
    `Domain: ${company?.domain || '-'}`,
    `Company Type: ${company?.companyType || '-'}`,
    `Registration #: ${company?.registrationNumber || '-'}`,
    `Language: ${company?.language || '-'}`,
    `Legal Status: ${company?.legalStatus || '-'}`,
    `# of Employees: ${company?.numberOfEmployees ?? '-'}`,
    `Country: ${company?.country || '-'}`,
    `Time Zone: ${company?.timeZone || '-'}`,
    `Colour Theme: ${company?.colourTheme || '-'}`,
    `Is Child: ${company?.isChild ? 'Yes' : 'No'}`,
  ];

  lines.forEach((line) => {
    doc.fontSize(12).text(line);
  });

  doc.moveDown();
}

function generateDepartmentListPDF(departmentData: { data: any[] }) {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc
      .fontSize(20)
      .text('Department List', { align: 'center', underline: true });
    doc.moveDown();

    const departments = departmentData.data;

    departments.forEach((dept: any, index: number) => {
      if (index > 0) doc.addPage();

      doc.fontSize(16).text(`Department #${index + 1}`, { underline: true });
      doc.moveDown(0.5);

      doc.fontSize(14).text('Basic Information', { underline: true });
      doc.fontSize(12).text(`Name: ${dept.departmentName || '-'}`);
      doc.moveDown();

      doc.fontSize(14).text('Parent Department', { underline: true });
      doc.fontSize(12).text(`Parent: ${dept.parentDepartment || '-'}`);
      doc.moveDown();

      doc.fontSize(14).text('Department Head', { underline: true });
      const head = dept.departmentHead || {};
      doc.fontSize(12).text(`Name: ${head.name || '-'}`);
      doc.text(`Email: ${head.email || '-'}`);
      doc.text(`Role: ${head.roleName || '-'}`);
      doc.text(`Position: ${head.position || '-'}`);
      doc.text(`DOJ: ${head.doj || '-'}`);
      doc.moveDown();

      doc.fontSize(14).text('Company Info', { underline: true });
      const company = dept.company || {};
      doc.fontSize(12).text(`Company Name: ${company.companyName || '-'}`);
      doc.text(`Type: ${company.companyType || '-'}`);
      doc.moveDown();
    });

    doc.end();
  });
}

export const pdfGenerators: {
  [key: string]: (params: { data: any[] }) => Promise<Buffer>;
} = {
  document: generateDocListPDF,
  department: generateDepartmentListPDF,
  company: generateCompanyPDF,
};
