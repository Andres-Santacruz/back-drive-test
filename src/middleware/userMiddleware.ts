import { NextFunction, Request, Response } from "express";
// import type {Users} from '@prisma/client'
import { JwtPayload, verify } from "jsonwebtoken";
import { VARIABLES } from "../config";

interface CustomRequest extends Request {
  user?: string | JwtPayload;
}

export const verifyUser = (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  const bearerToken = req.headers["authorization"];
  const token = bearerToken?.split(" ")[1];

  if (token == null) {
    return res.status(401).json({
      data: null,
      error: "No tienes permisos para esta acción",
    });
  }

  verify(token, VARIABLES.JWT_SECRET, (error, user) => {
    if (error || user == null) {
      return res.status(403).json({
        data: null,
        error: "No puedes realizar esta acción",
      });
    }

    req.user = user;
    next();
  });
};
