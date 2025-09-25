declare global {
  namespace Express {
    interface Request {
      user?: any; // Replace 'any' with your actual user type if you have one
      tenantId: string;
    }
  }
}
