import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.status(200);
  res.json({
    message: "OK",
    uptime: process.uptime(),
  });
});

export default router;
