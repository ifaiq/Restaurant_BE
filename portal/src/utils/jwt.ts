import jwt from 'jsonwebtoken';

export const jsonWeb = async (user: any, secret: string): Promise<string> => {
  const token = jwt.sign(
    {
      ...user,
    },
    secret,
    { expiresIn: '31d' },
  );
  return `Bearer ${token}`;
};
