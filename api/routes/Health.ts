import express, { Request, Response, Router } from "express";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response) => {
  res.status(200);
  res.json({
    message: "OK",
    PACKAGE_ADDRESS: process.env.PACKAGE_ADDRESS,
    SATOSHI_HOME_ADDRESS: process.env.SATOSHI_HOME_ADDRESS,
    HOUSE_DATA_ADDRESS: process.env.HOUSE_DATA_ADDRESS,
    TRUSTED_ORIGINS: process.env.TRUSTED_ORIGINS,
  });
});

export default router;
