import express, { Express } from "express";
import dotenv from "dotenv";
import modelRouter from "./routers/model-router";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get("/api/v1/model", modelRouter);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});