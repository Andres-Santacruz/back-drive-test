import { Request, Response, Router } from "express";
import { ApiResponseParse } from "../types";
import { URLS_DRIVE } from "../config";
import { prisma } from "../db";
import axios from "axios";
import Papaparse from "papaparse";

type TTypes = "ROTACION_DEL_PERSONAL" | "AUSENTISMO_LABORAL";

interface IBodyInforme {
  type: TTypes;
  url: string;
  company_id: number;
}

interface ICustomRequest extends Request {
  user?: {
    email: string;
  };
}

const informesRoute = Router();

informesRoute.post(
  "/add-informe",
  async (
    req: Request<{}, {}, IBodyInforme>,
    res: Response<ApiResponseParse<string | null>>
  ) => {
    const { company_id, type } = req.body;
    let url = "";
    if (type === "AUSENTISMO_LABORAL") {
      url = URLS_DRIVE.AUSENTISMO;
    }
    if (type === "ROTACION_DEL_PERSONAL") {
      url = URLS_DRIVE.ROTACION;
    }
    try {
      const resCreateInforme = await prisma.informes.create({
        data: {
          type,
          url,
          company_id,
        },
      });
      return res.json({
        data: `Informe craeado correctamente *** ${resCreateInforme.id}`,
        error: null,
      });
    } catch (err) {
      console.log("err", err);
      return res.json({
        data: null,
        error: "No se pudo crear informe",
      });
    }
  }
);

informesRoute.get("/informe/:id", async (req: ICustomRequest, res) => {
  const { id } = req.params;
  const email = req.user?.email;

  if (!email) {
    return res.status(401).json({
      error: "Usuario no encontrado",
      data: null,
    });
  }

  const resInforme = await prisma.informes.findFirst({
    where: {
      id: Number(id),
    },
  });

  if (resInforme == null) {
    return res.status(400).json({
      data: null,
      error: "No se encontro informe",
    });
  }

  const { url, type, company_id } = resInforme;

  const companyInfo = await prisma.companies.findFirst({
    where: {
      id: company_id,
    },
    select: {
      id: true,
      nameComercial: true,
      users: true,
    },
  });

  const findUser = companyInfo?.users.map((user) => user.email === email);

  if (!findUser || findUser.length === 0) {
    return res.status(401).json({
      data: null,
      error: "Usuario no tiene permiso para ver este informe",
    });
  }
  if (!findUser[0]) {
    return res.status(401).json({
      data: null,
      error: "Usuario no tiene permiso para ver este informe",
    });
  }

  const r = await axios.get(url, {
    responseType: "blob",
  });
  Papaparse.parse(r.data as any, {
    header: true,
    complete: (results) => {
      const resulstData = results.data;
      if (results.errors.length > 0) {
        return res.status(404).json({
          data: null,
          error: "No se pudo cargar la información",
        });
      }
      return res.json({
        data: {
          chart: resulstData,
          info: {
            type,
            companyName: companyInfo?.nameComercial,
          },
        },
        error: null,
      });
    },
  });
});

export { informesRoute };
