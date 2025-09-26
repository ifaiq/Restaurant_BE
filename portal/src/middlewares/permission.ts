// import { Request, Response, NextFunction } from 'express';
// import { AppDataSource } from '../config/database';
// import { User } from '../entity/User';
// // import { checkPermissions } from '../utils/checkPermissionHelper';

// const userRepo = AppDataSource.getRepository(User);
// export const permissions = async (
//   req: Request | any,
//   res: Response,
//   next: NextFunction,
// ): Promise<any> => {
//   try {
//     // const url = req?.baseUrl;
//     // const parts = url.split('/');
//     // const lastName = parts[parts.length - 1].toLowerCase();
//     const user = await userRepo.findOne({
//       where: { id: req.user?.id },
//     });
//     if (!user) {
//       return res
//         .status(403)
//         .json({ status: 403, message: 'You are not authenticated!' });
//     }

//     if (user?.isAdmin) {
//       return next();
//     }
//   } catch (error: any) {
//     return res.status(500).json({ status: 403, message: error.message });
//   }
// };
