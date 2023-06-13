import * as dotenv from "dotenv";
dotenv.config();

import express from "express";
import Papaparse from "papaparse";
import axios from "axios";
import cors from "cors";
import { userRoute } from "./routes/userRoutes";
import { companiesRoute } from "./routes/companiesRoute";
import { loginRoute } from "./routes/loginRoute";
import { VARIABLES } from "./config";
import { verifyUser } from "./middleware/userMiddleware";
import { informesRoute } from "./routes/informesRoute";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api", loginRoute);
app.use("/api", verifyUser, userRoute);
app.use("/api", verifyUser, companiesRoute);
app.use("/api", verifyUser, informesRoute);

app.get("/ping", async (_req, res) => {
  const r = await axios.get(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vQymxGabuvnQHcAgcJnJE75amAwmPnfsMiQTz2lygjgTlbI4ExSTWcpzL_uqbRfFpghUJQkSl3TRyyy/pub?output=csv",
    {
      responseType: "blob",
    }
  );
  Papaparse.parse(r.data as any, {
    header: true,
    complete: (results) => {
      const resulstData = results.data;
      if (results.errors.length > 0) {
        return res.send(results.errors);
      }
      return res.send(resulstData);
    },
  });

  // res.send("pong");
});

app.listen(VARIABLES.PORT, () => {
  console.log(`Server running on port ${VARIABLES.PORT}`);
});
