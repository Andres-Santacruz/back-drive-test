import { Request, Response, Router } from "express";
import jwt, { verify } from "jsonwebtoken";
import { ApiResponseParse } from "../types";
import { prisma } from "../db";
import { VARIABLES } from "../config";

const loginRoute = Router();

loginRoute.post(
  "/login",
  async (
    req: Request<{}, {}, { email: string; password: string }>,
    res: Response<
      ApiResponseParse<{
        token: string;
        name: string;
        email: string;
        rol: string;
        exp: number;
      } | null>
    >
  ) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        data: null,
        error: "Email y contraseña son requeridos",
      });
    }
    const resUser = await prisma.users.findFirst({
      where: {
        email,
      },
    });
    if (resUser == null) {
      return res.status(400).json({
        data: null,
        error: "Usuario no existe",
      });
    }
    if (resUser.password !== password) {
      return res.status(400).json({
        data: null,
        error: "Contraseña incorrecta",
      });
    }
    const dataJWT = {
      email,
      name: resUser.name,
      rol: resUser.rol,
      exp: Date.now() + 1000 * 60 * 60 * 24,
    };
    const token = jwt.sign(dataJWT, VARIABLES.JWT_SECRET);
    return res.json({
      data: {
        ...dataJWT,
        token,
      },
      error: null,
    });
  }
);

loginRoute.get(
  "/verify",
  (
    req,
    res: Response<
      ApiResponseParse<{
        email: string;
        name: string;
        rol: string;
        exp: number;
        token: string;
      } | null>
    >
  ) => {
    const bearerToken = req.headers.authorization;
    const token = bearerToken?.split(" ")[1];

    if (token == null) {
      return res.status(401).json({
        data: null,
        error: "No tienes permisos",
      });
    }

    verify(token, VARIABLES.JWT_SECRET, async (error, user) => {
      if (error || user == null) {
        return res.status(401).json({
          data: null,
          error: "No tienes permisos",
        });
      }
      const time = (user as { exp: number }).exp;
      if (Date.now() > time) {
        return res.status(401).json({
          data: null,
          error: "Sesión terminó",
        });
      }

      const resUser = await prisma.users.findFirst({
        where: {
          email: (user as { email: string }).email,
        },
      });

      if (resUser == null) {
        return res.status(401).json({
          data: null,
          error: "No tienes permisos",
        });
      }

      const dataJWT = {
        email: resUser.email,
        name: resUser.name,
        rol: resUser.rol,
        exp: Date.now() + 1000 * 60 * 60 * 24,
      };
      const token = jwt.sign(dataJWT, VARIABLES.JWT_SECRET);
      return res.json({
        data: {
          ...dataJWT,
          token,
        },
        error: null,
      });
    });
  }
);

export { loginRoute };
