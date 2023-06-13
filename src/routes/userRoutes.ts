import { Router, Response, Request } from "express";
import { prisma } from "../db";
import { ApiResponseParse } from "../types";
import type { Users } from "@prisma/client";

const userRoute = Router();

userRoute.get(
  "/users",
  async (_req, res: Response<ApiResponseParse<Users[]>>) => {
    const users = await prisma.users.findMany();

    res.json({
      data: users,
      error: null,
    });
  }
);
interface IReqBody {
  name: string;
  surname: string;
  phoneNumberUser: string;
  email: string;
  password: string;
  confirmPassword: string;
  companyId: number;
}
userRoute.post(
  "/add-user",
  async (
    req: Request<{}, {}, IReqBody>,
    res: Response<ApiResponseParse<string | null>>
  ) => {
    const {
      name,
      surname,
      phoneNumberUser,
      email,
      password,
      confirmPassword,
      companyId,
    } = req.body;
    if (password !== confirmPassword) {
      return res.status(400).json({
        data: null,
        error: "Las contraseña no coinciden",
      });
    }
    if (!name || !surname || !phoneNumberUser || !email || !password) {
      return res.status(400).json({
        data: null,
        error: "Todos los campos son requeridos",
      });
    }
    const userExists = await prisma.users.findFirst({
      where: {
        email,
      },
    });

    if (userExists) {
      return res.status(400).json({
        data: null,
        error: `Usuario ya registrado con este email: ${email}`,
      });
    }
    try {
      const resNewUser = await prisma.users.create({
        data: {
          email,
          name,
          password,
          phoneNumberUser,
          surname,
          company_id: companyId,
        },
      });
      return res.status(200).json({
        data: `Usuario creado correctamente *** ${resNewUser.id}`,
        error: null,
      });
    } catch (error) {
      return res.status(400).json({
        data: null,
        error: `Error al crear: ${error}`,
      });
    }
  }
);

export { userRoute };
