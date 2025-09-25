import excelJs from 'exceljs';

export const createExampleExcel = async () => {
  const workbook = new excelJs.Workbook();
  const sheet = workbook.addWorksheet('My Sheet', {
    views: [{ state: 'frozen', xSplit: 1, ySplit: 1 }],
  });

  sheet.addRow([
    'Name',
    'Email',
    'Password',
    'Country',
    'Date of Joining',
    'Employee ID',
    'Company',
    'Department',
    'Manager',
  ]);

  sheet.addRow([
    'John Doe',
    'johndoe@doe.com',
    'password123!',
    'USA',
    '12/12/12',
    'E123',
    'ABC Inc.',
    'IT',
    'Jane Doe',
  ]);

  const fileName = 'example.xlsx';
  await workbook.xlsx.writeFile(fileName);
};
