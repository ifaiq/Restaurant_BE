/* eslint-disable @typescript-eslint/no-unused-vars */
import { Request } from 'express';
import { RoleName, User } from '../entity/User';

const actionMappings: Record<string, string> = {
  GET: 'view',
  POST: 'create',
  PUT: 'update',
  DELETE: 'delete',
};

export const checkPermissions = async (req: Request | any, userData: User) => {
  try {
    const route = req?.baseUrl?.split('/').pop()?.toLowerCase() || '';
    const action = req?.method;
    const permissions = req?.permissionData;

    const matchingPermission = permissions?.permissions?.find((ele: any) => {
      return ele.route === route && ele.actions[action];
    });
    const friendlyAction = actionMappings[action] || action;

    if (userData?.roleName === RoleName.ADMIN) {
      return {
        status: 200,
        message: `You are allowed to perform ${action} on the ${route} route!`,
      };
    }
    if (!matchingPermission || !userData?.role?.permissions?.length) {
      return {
        status: 403,
        message: `You are not allowed to ${friendlyAction} the ${route}!`,
      };
    }
    return {
      status: 200,
      message: `You are allowed to perform ${action} on the ${route} route!`,
    };
  } catch (error: any) {
    return {
      status: 500,
      message: error.message,
    };
  }
};
