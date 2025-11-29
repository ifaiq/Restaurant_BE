// Shared email template styles and utilities
const sharedStyles = `
  <style type="text/css">
    body {
      padding: 0 !important;
      margin: 0 auto !important;
      display: block !important;
      min-width: 100% !important;
      width: 100% !important;
      background: #f5f5f5;
      font-family: 'PT Sans', Arial, sans-serif;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    a {
      color: #000000;
      text-decoration: none;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      font-size: 16px;
      font-weight: 600;
      color: #ffffff !important;
      background: #000000;
      text-decoration: none;
      border-radius: 8px;
      text-align: center;
      transition: opacity 0.3s;
    }
    .btn:hover {
      opacity: 0.85;
    }
    .info-box {
      background: #f8f9fa;
      border-left: 4px solid #000000;
      padding: 16px 20px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .otp-code {
      display: inline-block;
      padding: 16px 32px;
      background: #f8f9fa;
      border: 2px dashed #000000;
      border-radius: 8px;
      font-size: 28px;
      font-weight: bold;
      letter-spacing: 4px;
      color: #000000;
      font-family: 'Courier New', monospace;
    }
    @media only screen and (max-width: 600px) {
      .m-shell {
        width: 100% !important;
        min-width: 100% !important;
      }
      .mpx-15 {
        padding-left: 15px !important;
        padding-right: 15px !important;
      }
      .mt-30 {
        margin-top: 20px !important;
      }
      .otp-code {
        font-size: 24px !important;
        letter-spacing: 2px !important;
        padding: 12px 24px !important;
      }
    }
  </style>
`;

export const approvalEmailTemplate = (
  message: any,
  expireDate: Date,
  document: any,
  view: string,
) => {
  const formattedExpireDate =
    expireDate instanceof Date
      ? expireDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      : new Date(expireDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
  const submissionDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="date=no" />
  <meta name="format-detection" content="address=no" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <title>Document Approval Request</title>
  ${sharedStyles}
</head>
<body>
  <center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5" style="padding: 20px 0;">
      <tr>
        <td align="center" valign="top">
          <table width="600" border="0" cellspacing="0" cellpadding="0" class="m-shell" style="max-width: 600px; width: 100%;">
            <tr>
              <td>
                <!-- Header -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000" style="border-radius: 10px 10px 0 0;">
                  <tr>
                    <td style="padding: 30px 40px;" class="mpx-15">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; font-family: 'PT Sans', Arial, sans-serif;">
                        Document Approval Required
                      </h1>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 0 0 10px 10px;">
                  <tr>
                    <td style="padding: 40px;" class="mpx-15">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                        Hello,
                      </p>
                      <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 24px; color: #000000; font-family: 'PT Sans', Arial, sans-serif;">
                        A new document has been submitted and requires your review and approval.
                      </p>

                      <!-- Document Details Box -->
                      <div class="info-box" style="background: #f8f9fa; border-left: 4px solid #000000; padding: 20px; margin: 25px 0; border-radius: 4px;">
                        <h3 style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #000000; font-family: 'PT Sans', Arial, sans-serif;">
                          Document Details
                        </h3>
                        <table width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td style="padding: 8px 0; font-size: 15px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                              <strong style="color: #000000;">Title:</strong> ${document}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 15px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                              <strong style="color: #000000;">Message:</strong> ${message}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 15px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                              <strong style="color: #000000;">Expiry Date:</strong> ${formattedExpireDate}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 15px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                              <strong style="color: #000000;">Submission Date:</strong> ${submissionDate}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <p style="margin: 30px 0 20px 0; font-size: 16px; line-height: 24px; color: #000000; font-family: 'PT Sans', Arial, sans-serif;">
                        Please review and take the necessary action.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${view}" class="btn" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff !important; background: #000000; text-decoration: none; border-radius: 8px; text-align: center;">
                              Review & Approve Document
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 22px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                        If you have any questions or require assistance, please contact our support team.
                      </p>

                      <!-- Footer -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                        <tr>
                          <td style="padding: 10px 0 0 0; font-size: 14px; line-height: 22px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                            Best regards,<br />
                            <strong style="color: #000000;">Jaggha Team</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
};

export const loginInfoEmailTemplate = (password: string) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="date=no" />
  <meta name="format-detection" content="address=no" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <title>Welcome to Jaggha</title>
  ${sharedStyles}
</head>
<body>
  <center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5" style="padding: 20px 0;">
      <tr>
        <td align="center" valign="top">
          <table width="600" border="0" cellspacing="0" cellpadding="0" class="m-shell" style="max-width: 600px; width: 100%;">
            <tr>
              <td>
                <!-- Header -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000" style="border-radius: 10px 10px 0 0;">
                  <tr>
                    <td style="padding: 40px;" class="mpx-15">
                      <h1 style="margin: 0; font-size: 32px; font-weight: 700; color: #ffffff; font-family: 'PT Sans', Arial, sans-serif; text-align: center;">
                        Welcome to Jaggha!
                      </h1>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 0 0 10px 10px;">
                  <tr>
                    <td style="padding: 40px;" class="mpx-15">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #000000; font-family: 'PT Sans', Arial, sans-serif;">
                        Your account has been successfully created! We're excited to have you on board.
                      </p>

                      <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 24px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                        Below are your temporary login credentials:
                      </p>

                      <!-- Password Box -->
                      <div style="background: #f8f9fa; border: 2px solid #000000; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
                        <p style="margin: 0 0 10px 0; font-size: 14px; color: #666666; font-family: 'PT Sans', Arial, sans-serif; text-transform: uppercase; letter-spacing: 1px;">
                          Temporary Password
                        </p>
                        <p style="margin: 0; font-size: 24px; font-weight: 600; color: #000000; font-family: 'Courier New', monospace; letter-spacing: 2px; word-break: break-all;">
                          ${password}
                        </p>
                      </div>

                      <!-- Security Notice -->
                      <div class="info-box" style="background: #f8f9fa; border-left: 4px solid #000000; padding: 16px 20px; margin: 25px 0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 15px; line-height: 22px; color: #333333; font-family: 'PT Sans', Arial, sans-serif;">
                          <strong>🔒 Security Notice:</strong> For your account security, please log in and change your password immediately after first login.
                        </p>
                      </div>

                      <p style="margin: 30px 0 20px 0; font-size: 16px; line-height: 24px; color: #000000; font-family: 'PT Sans', Arial, sans-serif;">
                        You can now access your account using these credentials.
                      </p>

                      <!-- Footer -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                        <tr>
                          <td style="padding: 10px 0 0 0; font-size: 14px; line-height: 22px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                            Thank you for joining us!<br />
                            <strong style="color: #000000;">The Jaggha Team</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
};

export const resetPasswordKeyEmailTemplate = (resetUrl: string) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="date=no" />
  <meta name="format-detection" content="address=no" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <title>Reset Your Password</title>
  ${sharedStyles}
</head>
<body>
  <center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5" style="padding: 20px 0;">
      <tr>
        <td align="center" valign="top">
          <table width="600" border="0" cellspacing="0" cellpadding="0" class="m-shell" style="max-width: 600px; width: 100%;">
            <tr>
              <td>
                <!-- Header -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000" style="border-radius: 10px 10px 0 0;">
                  <tr>
                    <td style="padding: 40px;" class="mpx-15">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; font-family: 'PT Sans', Arial, sans-serif; text-align: center;">
                        Reset Your Password
                      </h1>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 0 0 10px 10px;">
                  <tr>
                    <td style="padding: 40px;" class="mpx-15">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #000000; font-family: 'PT Sans', Arial, sans-serif;">
                        Hello,
                      </p>
                      <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 24px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                        We received a request to reset your password. Click the button below to proceed with resetting your password.
                      </p>

                      <!-- CTA Button -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}" class="btn" style="display: inline-block; padding: 14px 32px; font-size: 16px; font-weight: 600; color: #ffffff !important; background: #000000; text-decoration: none; border-radius: 8px; text-align: center;">
                              Reset Password
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 25px 0 0 0; font-size: 14px; line-height: 22px; color: #666666; font-family: 'PT Sans', Arial, sans-serif; text-align: center;">
                        Or copy and paste this link into your browser:
                      </p>
                      <p style="margin: 10px 0 25px 0; font-size: 13px; line-height: 20px; color: #000000; font-family: 'Courier New', monospace; word-break: break-all; text-align: center; text-decoration: underline;">
                        ${resetUrl}
                      </p>

                      <!-- Security Notice -->
                      <div class="info-box" style="background: #f8f9fa; border-left: 4px solid #000000; padding: 16px 20px; margin: 25px 0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #333333; font-family: 'PT Sans', Arial, sans-serif;">
                          <strong>⚠️ Important:</strong> This link will expire in 24 hours. If you didn't request a password reset, you can safely ignore this email.
                        </p>
                      </div>

                      <!-- Footer -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                        <tr>
                          <td style="padding: 10px 0 0 0; font-size: 14px; line-height: 22px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                            Best regards,<br />
                            <strong style="color: #000000;">Jaggha Team</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
};

export const resetPasswordEmailTemplate = (uniqueID: string) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="format-detection" content="date=no" />
  <meta name="format-detection" content="address=no" />
  <meta name="format-detection" content="telephone=no" />
  <meta name="x-apple-disable-message-reformatting" />
  <link href="https://fonts.googleapis.com/css2?family=PT+Sans:wght@400;600;700&display=swap" rel="stylesheet" />
  <title>Reset Your Password</title>
  ${sharedStyles}
</head>
<body>
  <center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f5f5f5" style="padding: 20px 0;">
      <tr>
        <td align="center" valign="top">
          <table width="600" border="0" cellspacing="0" cellpadding="0" class="m-shell" style="max-width: 600px; width: 100%;">
            <tr>
              <td>
                <!-- Header -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#000000" style="border-radius: 10px 10px 0 0;">
                  <tr>
                    <td style="padding: 40px;" class="mpx-15">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; font-family: 'PT Sans', Arial, sans-serif; text-align: center;">
                        Reset Your Password
                      </h1>
                    </td>
                  </tr>
                </table>

                <!-- Content -->
                <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" style="border-radius: 0 0 10px 10px;">
                  <tr>
                    <td style="padding: 40px;" class="mpx-15">
                      <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #000000; font-family: 'PT Sans', Arial, sans-serif;">
                        Hello,
                      </p>
                      <p style="margin: 0 0 25px 0; font-size: 16px; line-height: 24px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                        We received a request to reset your password. Use the verification code below to complete the process:
                      </p>

                      <!-- OTP Code Box -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 30px 0;">
                        <tr>
                          <td align="center">
                            <div style="display: inline-block; padding: 20px 40px; background: #f8f9fa; border: 3px dashed #000000; border-radius: 10px;">
                              <p style="margin: 0; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #000000; font-family: 'Courier New', monospace; text-align: center;">
                                ${uniqueID}
                              </p>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <p style="margin: 25px 0 0 0; font-size: 15px; line-height: 23px; color: #666666; font-family: 'PT Sans', Arial, sans-serif; text-align: center;">
                        Enter this code in the password reset form to verify your identity.
                      </p>

                      <!-- Security Notice -->
                      <div class="info-box" style="background: #f8f9fa; border-left: 4px solid #000000; padding: 16px 20px; margin: 30px 0; border-radius: 4px;">
                        <p style="margin: 0; font-size: 14px; line-height: 22px; color: #333333; font-family: 'PT Sans', Arial, sans-serif;">
                          <strong>🔒 Security:</strong> This code will expire in 24 hours. If you didn't request a password reset, please ignore this email and contact support if you have concerns.
                        </p>
                      </div>

                      <!-- Footer -->
                      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-top: 40px; padding-top: 30px; border-top: 1px solid #e0e0e0;">
                        <tr>
                          <td style="padding: 10px 0 0 0; font-size: 14px; line-height: 22px; color: #666666; font-family: 'PT Sans', Arial, sans-serif;">
                            Best regards,<br />
                            <strong style="color: #000000;">Jaggha Team</strong>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
};
