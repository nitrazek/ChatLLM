import { Request, Response } from "express";
import { Router } from "express";

const modelRouter = Router();

modelRouter.post("/messages", (req: Request, res: Response) => {
  res.send("Hello World");
});

export default modelRouter;