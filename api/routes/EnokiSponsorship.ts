import axios from "axios";
import express, { Router, Request, Response, NextFunction } from "express";

// app is deployed on testnet but let's check it based on the full node URL
const networkName = process.env.SUI_NETWORK?.includes("testnet")
  ? "testnet"
  : "mainnet";

const router: Router = express.Router();

router.post(
  "/create",
  async (req: Request, res: Response, next: NextFunction) => {
    const { bytes, sender }: { bytes: string; sender: string } = req.body;
    await axios
      .post(
        "https://api.enoki.mystenlabs.com/v1/transaction-blocks/sponsor",
        {
          network: networkName,
          transactionBlockKindBytes: bytes,
          sender,
          allowedMoveCallTargets: [
            `${process.env.PACKAGE_ADDRESS}::counter_nft::mint`,
            `${process.env.PACKAGE_ADDRESS}::counter_nft::transfer_to_sender`,
            `${process.env.PACKAGE_ADDRESS}::counter_nft::burn`,
            `${process.env.PACKAGE_ADDRESS}::single_player_satoshi::start_game`,
          ],
          allowedAddresses: [sender],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.ENOKI_API_KEY}`,
          },
        }
      )
      .then((resp) => {
        res.status(200);
        res.json(resp.data.data);
      })
      .catch((err) => {
        console.log(JSON.stringify(err.response.data, null, 2));
        res.status(500);
        next(err);
      });
  }
);

router.post(
  "/execute",
  async (req: Request, res: Response, next: NextFunction) => {
    const { digest, signature }: { digest: string; signature: string } =
      req.body;
    await axios
      .post(
        `https://api.enoki.mystenlabs.com/v1/transaction-blocks/sponsor/${digest}`,
        { signature },
        {
          headers: {
            Authorization: `Bearer ${process.env.ENOKI_API_KEY}`,
          },
        }
      )
      .then((resp) => {
        res.status(200);
        res.json({ digest: resp.data.data.digest });
      })
      .catch((err) => {
        console.log(JSON.stringify(err.response.data, null, 2));
        res.status(500);
        next(err);
      });
  }
);

export default router;
