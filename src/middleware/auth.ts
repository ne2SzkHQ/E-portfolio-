import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string | number;
    role: string;
    email?: string;
    [key: string]: any;
  };
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const tokenHeader = req.header("Authorization") || req.header("authorization");

  if (!tokenHeader) {
    return res.status(401).json({
      success: false,
      message: "Access denied"
    });
  }

  try {
    const token = tokenHeader.startsWith("Bearer ") ? tokenHeader.slice(7) : tokenHeader;
    const jwtSecret = process.env.JWT_SECRET || "super_secret_key";
    const verified = jwt.verify(token, jwtSecret);

    req.user = verified as any;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid Token"
    });
  }
};
