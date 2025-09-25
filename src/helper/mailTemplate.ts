export const approvalEmailTemplate = (
  message: any,
  expireDate: Date,
  document: any,
  view: string,
) => {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <!-- Styles and meta as in your original template -->
  <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <link href="https://fonts.googleapis.com/css?family=PT+Sans:400,700&display=swap" rel="stylesheet" />
  <style>
    body { background:#f4ecfa; padding:0; margin:0; font-family:'PT Sans', Arial, sans-serif; }
    a { color:#f3189e; text-decoration:none; }
    .btn a { display:inline-block; padding:12px 24px; background:linear-gradient(to right, #9028df, #f3189e); border-radius:6px; color:#fff; font-weight:bold; }
  </style>
</head>
<body>
  <center>
    <table width="100%" bgcolor="#f4ecfa" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center">
          <table width="600" bgcolor="#ffffff" cellpadding="40" cellspacing="0" style="border-radius:10px;">
            <tr>
              <td>
                <p style="font-size:16px; color:#6e6e6e; line-height:26px; margin-top:30px;">
                  Hi,
                </p>
                <p style="font-size:16px; color:#6e6e6e; line-height:26px; margin-top:20px;">
                  A new document has been submitted and requires your review and approval.
                </p>
                <h3 style="font-size:18px; color:#282828; margin-top:30px;">Document Details:</h3>
                <ul style="font-size:16px; color:#6e6e6e; line-height:26px; list-style-type:none; padding-left:0;">
                <li><strong>Title:</strong> ${document}</li>  
                <li><strong>Message:</strong> ${message}</li>
<li><strong>Expiry Date:</strong> ${expireDate instanceof Date ? expireDate.toLocaleDateString() : new Date(expireDate).toLocaleDateString()}</li>
                  <li><strong>Submission Date:</strong> ${new Date().toLocaleDateString()}</li></ul>

                  <p style="font-size:16px; color:#6e6e6e; line-height:26px; margin-top:30px;"> Please log in to the admin portal to review and take the necessary action. <a href="${view}" style="color: #007bff; text-decoration: none;">Click here</a> to approve Document Now. </p>
                <p style="font-size:16px; color:#6e6e6e; line-height:26px;">
                  If you have any questions or require assistance, feel free to contact the Nerdy Buddy support team.
                </p>
                <p style="font-size:16px; color:#6e6e6e; line-height:26px; margin-top:30px;">
                  Thank you,<br />
                  <strong>Nerdy Buddy Team</strong>
                </p>
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
	<!--[if gte mso 9]>
	<xml>
		<o:OfficeDocumentSettings>
		<o:AllowPNG/>
		<o:PixelsPerInch>96</o:PixelsPerInch>
		</o:OfficeDocumentSettings>
	</xml>
	<![endif]-->
	<meta http-equiv="Content-type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
	<meta http-equiv="X-UA-Compatible" content="IE=edge" />
	<meta name="format-detection" content="date=no" />
	<meta name="format-detection" content="address=no" />
	<meta name="format-detection" content="telephone=no" />
	<meta name="x-apple-disable-message-reformatting" />
	<!--[if !mso]><!-->
	<link href="https://fonts.googleapis.com/css?family=PT+Sans:400,400i,700,700i&display=swap" rel="stylesheet" />
	<!--<![endif]-->
	<title>Email Template</title>
	<!--[if gte mso 9]>
	<style type="text/css" media="all">
		sup { font-size: 100% !important; }
	</style>
	<![endif]-->
	<!-- body, html, table, thead, tbody, tr, td, div, a, span { font-family: Arial, sans-serif !important; } -->
	

	<style type="text/css" media="screen">
		body { padding:0 !important; margin:0 auto !important; display:block !important; min-width:100% !important; width:100% !important; background:#f4ecfa; -webkit-text-size-adjust:none }
		a { color:#f3189e; text-decoration:none }
		p { padding:0 !important; margin:0 !important } 
		img { margin: 0 !important; -ms-interpolation-mode: bicubic; /* Allow smoother rendering of resized image in Internet Explorer */ }

		a[x-apple-data-detectors] { color: inherit !important; text-decoration: inherit !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
		
		.btn-16 a { display: block; padding: 15px 35px; text-decoration: none; }
		.btn-20 a { display: block; padding: 15px 35px; text-decoration: none; }

		.l-white a { color: #ffffff; }
		.l-black a { color: #282828; }
		.l-pink a { color: #f3189e; }
		.l-grey a { color: #6e6e6e; }
		.l-purple a { color: #9128df; }

		.gradient { background: linear-gradient(to right, #9028df 0%,#f3189e 100%); }

		.btn-secondary { border-radius: 10px; background: linear-gradient(to right, #9028df 0%,#f3189e 100%); }

				
		/* Mobile styles */
		@media only screen and (max-device-width: 480px), only screen and (max-width: 480px) {
			.mpx-10 { padding-left: 10px !important; padding-right: 10px !important; }

			.mpx-15 { padding-left: 15px !important; padding-right: 15px !important; }

			u + .body .gwfw { width:100% !important; width:100vw !important; }

			.td,
			.m-shell { width: 100% !important; min-width: 100% !important; }
			
			.mt-left { text-align: left !important; }
			.mt-center { text-align: center !important; }
			.mt-right { text-align: right !important; }
			
			.me-left { margin-right: auto !important; }
			.me-center { margin: 0 auto !important; }
			.me-right { margin-left: auto !important; }

			.mh-auto { height: auto !important; }
			.mw-auto { width: auto !important; }

			.fluid-img img { width: 100% !important; max-width: 100% !important; height: auto !important; }

			.column,
			.column-top,
			.column-dir-top { float: left !important; width: 100% !important; display: block !important; }

			.m-hide { display: none !important; width: 0 !important; height: 0 !important; font-size: 0 !important; line-height: 0 !important; min-height: 0 !important; }
			.m-block { display: block !important; }

			.mw-15 { width: 15px !important; }

			.mw-2p { width: 2% !important; }
			.mw-32p { width: 32% !important; }
			.mw-49p { width: 49% !important; }
			.mw-50p { width: 50% !important; }
			.mw-100p { width: 100% !important; }

			.mmt-0 { margin-top: 0 !important; }
		}

			</style>
</head>
<body class="body" style="padding:0 !important; margin:0 auto !important; display:block !important; min-width:100% !important; width:100% !important; background:#f4ecfa; -webkit-text-size-adjust:none;">
	<center>
		<table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 0; padding: 0; width: 100%; height: 100%;" bgcolor="#f4ecfa" class="gwfw">
			<tr>
				<td style="margin: 0; padding: 0; width: 100%; height: 100%;" align="center" valign="top">
					  <table width="600" border="0" cellspacing="0" cellpadding="0" class="m-shell">
    <tr>
      <td class="td" style="width:600px; min-width:600px; font-size:0pt; line-height:0pt; padding:0; margin:0; font-weight:normal;">
        <table width="100%" border="0" cellspacing="0" cellpadding="0">
          <tr>
            <td class="mpx-10">
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td class="gradient pt-10" style="border-radius: 10px 10px 0 0; padding-top: 10px;" bgcolor="#f3189e">
                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td style="border-radius: 10px 10px 0 0;" bgcolor="#ffffff">
                          <table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tr>
                              <td class="px-50 mpx-15" style="padding-left: 50px; padding-right: 50px;">
                                <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                  <tr>
                                    <td class="pb-50" style="padding-bottom: 50px;">
                                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                        <tr>
                                          <td class="title-36 a-center pb-15" style="font-size:36px; line-height:40px; color:#282828; font-family:'PT Sans', Arial, sans-serif; min-width:auto !important; text-align:center; padding-bottom: 15px;">
                                            <strong>Welcome!</strong>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="text-16 lh-26 a-center pb-25" style="font-size:16px; color:#6e6e6e; font-family:'PT Sans', Arial, sans-serif; min-width:auto !important; line-height: 26px; text-align:center; padding-bottom: 25px;">
                                            Your account has been successfully created. Below is your temporary login information:
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="text-16 lh-26 a-center pb-25" style="font-size:16px; color:#6e6e6e; font-family:'PT Sans', Arial, sans-serif; min-width:auto !important; line-height: 26px; text-align:center; padding-bottom: 25px;">
                                            Password: <strong>${password}</strong>
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="text-16 lh-26 a-center pb-25" style="font-size:16px; color:#6e6e6e; font-family:'PT Sans', Arial, sans-serif; min-width:auto !important; line-height: 26px; text-align:center; padding-bottom: 25px;">
                                            Please log in to your account and update your password immediately for security purposes.
                                          </td>
                                        </tr>
                                        <tr>
                                          <td class="text-16 lh-26 a-center" style="font-size:16px; color:#6e6e6e; font-family:'PT Sans', Arial, sans-serif; min-width:auto !important; line-height: 26px; text-align:center;">
                                            Thank you,<br />
                                            NerdyBuddy
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
</html>
`;
};

export const resetPasswordKeyEmailTemplate = (uniqueID: string) => {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Reset Password</title>
  <style type="text/css">
    body {
      padding: 0 !important;
      margin: 0 auto !important;
      display: block !important;
      min-width: 100% !important;
      width: 100% !important;
      background: #f4ecfa;
      font-family: Arial, sans-serif;
    }
    a {
      color: #f3189e;
      text-decoration: none;
    }
    p {
      margin: 0;
    }
    .gradient {
      background: linear-gradient(to right, #9028df 0%, #f3189e 100%);
    }
    .btn {
      display: inline-block;
      padding: 10px 25px;
      margin-top: 20px;
      font-size: 16px;
      color: #ffffff;
      background: linear-gradient(to right, #9028df 0%, #f3189e 100%);
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4ecfa">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 10px; padding: 20px;">
            <tr>
              <td style="text-align: center; padding: 20px 0;">
                <h1 style="color: #282828; font-size: 24px;">Reset Your Password</h1>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; color: #6e6e6e; font-size: 16px; line-height: 1.5;">
                <p>We received a request to reset your password. Use the link below to proceed:</p>
                <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">${uniqueID}</p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 20px 0; color: #6e6e6e; font-size: 14px;">
                <p>Thank you,</p>
                <p><strong>NerdyBuddy</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `;
};

export const resetPasswordEmailTemplate = (uniqueID: string) => {
  return `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta http-equiv="Content-type" content="text/html; charset=utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Reset Password</title>
  <style type="text/css">
    body {
      padding: 0 !important;
      margin: 0 auto !important;
      display: block !important;
      min-width: 100% !important;
      width: 100% !important;
      background: #f4ecfa;
      font-family: Arial, sans-serif;
    }
    a {
      color: #f3189e;
      text-decoration: none;
    }
    p {
      margin: 0;
    }
    .gradient {
      background: linear-gradient(to right, #9028df 0%, #f3189e 100%);
    }
    .btn {
      display: inline-block;
      padding: 10px 25px;
      margin-top: 20px;
      font-size: 16px;
      color: #ffffff;
      background: linear-gradient(to right, #9028df 0%, #f3189e 100%);
      text-decoration: none;
      border-radius: 5px;
    }
  </style>
</head>
<body>
  <center>
    <table width="100%" border="0" cellspacing="0" cellpadding="0" bgcolor="#f4ecfa">
      <tr>
        <td align="center">
          <table width="600" border="0" cellspacing="0" cellpadding="0" style="background: #ffffff; border-radius: 10px; padding: 20px;">
            <tr>
              <td style="text-align: center; padding: 20px 0;">
                <h1 style="color: #282828; font-size: 24px;">Reset Your Password</h1>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; color: #6e6e6e; font-size: 16px; line-height: 1.5;">
                <p>We received a request to reset your password. You can find the OTP below:</p>
                <p style="font-size: 18px; font-weight: bold; margin: 20px 0;">${uniqueID}</p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
                <a href="${uniqueID}" class="btn">Reset Password</a>
              </td>
            </tr>
            <tr>
              <td style="text-align: center; padding: 20px 0; color: #6e6e6e; font-size: 14px;">
                <p>Thank you,</p>
                <p><strong>NerdyBuddy</strong></p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </center>
</body>
</html>
  `;
};
