import { Response, NextFunction } from "express";
import { AuthenticatedRequest } from "./auth.ts";

export const roleMiddleware = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Permission denied"
      });
    }
    next();
  };
};
