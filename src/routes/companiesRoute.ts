import { Request, Response, Router } from "express";
import { prisma } from "../db";
import { ApiResponseParse } from "../types";
import type { Companies } from "@prisma/client";
import { verify } from "jsonwebtoken";
import { VARIABLES } from "../config";
const companiesRoute = Router();

companiesRoute.get(
  "/companies",
  async (req, res: Response<ApiResponseParse<Companies | null>>) => {
    const bearerToken = req.headers.authorization;
    const token = bearerToken?.split(" ")[1];
    if (token == null) {
      return res.status(401).json({
        data: null,
        error: "No tienes permiso de ver las compañias",
      });
    }

    verify(token, VARIABLES.JWT_SECRET, async (error, user) => {
      if (error || user == null) {
        return res.status(401).json({
          data: null,
          error: "No tienes permisos",
        });
      }
      const { email } = user as { email: string };
      const resUser = await prisma.users.findFirst({
        include: {
          company: true,
        },
        where: {
          email,
        },
      });

      if (resUser == null) {
        return res.status(401).json({
          data: null,
          error: "No tienes permisos",
        });
      }

      const resCompanies = await prisma.companies.findFirst({
        where: {
          id: resUser.company.id,
        },
        include: {
          informes: true,
        },
      });

      if (resCompanies == null) {
        return res.status(401).json({
          data: null,
          error: "No tienes permisos",
        });
      }

      const informes = resCompanies.informes.map(({ id, type }) => ({
        id,
        type,
      }));

      return res.status(200).json({
        data: { ...resUser.company, informes } as Companies,
        error: null,
      });
    });

    // const resCompanies = await prisma.companies.findMany();
  }
);

interface IBodyCompany {
  comercialName: string;
  businessName: string;
  nit: string;
  departament: string;
  city: string;
  address: string;
  phoneNumber: string;
}

type TRol = "ADMIN" | "USER";

interface CustomRequest extends Request<{}, {}, IBodyCompany> {
  user?: {
    rol: TRol;
  };
}

companiesRoute.post(
  "/add-company",
  async (
    req: CustomRequest,
    res: Response<ApiResponseParse<string | null>>
  ) => {
    const user = req.user;

    if (user?.rol !== "ADMIN") {
      return res.status(401).json({
        data: null,
        error: "No tienes permisos para realizar esta acción",
      });
    }

    const {
      address,
      businessName,
      city,
      comercialName,
      departament,
      nit,
      phoneNumber,
    } = req.body;
    if (
      !address ||
      !businessName ||
      !city ||
      !comercialName ||
      !departament ||
      !nit ||
      !phoneNumber
    ) {
      return res.status(400).json({
        data: null,
        error: "Todos los campos son requeridos",
      });
    }
    try {
      const resCreate = await prisma.companies.create({
        data: {
          address,
          businessName,
          city,
          departament,
          nameComercial: comercialName,
          nit,
          phoneNumber,
        },
      });
      return res.json({
        data: `Compañia creada correctamente *** ${resCreate.id}`,
        error: null,
      });
    } catch (err) {
      return res.status(401).json({
        data: null,
        error: `ERROR al crear: ${err}`,
      });
    }
  }
);

export { companiesRoute };
