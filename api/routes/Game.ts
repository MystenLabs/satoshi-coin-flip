// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import express, { Router, Request, Response, NextFunction } from "express";
import {
  checkPlayGame,
  checkRegisterGame,
  checkSign,
  checkSinglePlayerEnd,
  checkVerify,
} from "../middleware";
import services from "../services/";

const GameService = services.SatoshiGameService;

const router: Router = express.Router();

router.get(
  "/details",
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("GET /game/details");

    try {
      let games = GameService.getGames();
      res.status(200);
      res.json({
        games,
      });
    } catch (e) {
      console.error(`Bad things have happened while calling /game/details:`, e);
      // Forward the error to the error handler
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/register",
  checkRegisterGame,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /game/register with body:", req.body);

    try {
      let registered = GameService.registerGame(
        req.body.gameId,
        req.body.txnDigest
      );
      res.status(200);
      res.json({
        registered,
      });
    } catch (e) {
      console.error(
        `Bad things have happened while calling /game/register with id "${req.body.gameId}":`,
        e
      );
      // Forward the error to the error handler
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/play",
  checkPlayGame,
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("POST /game/play with body:", req.body);
    try {
      // register, sign, and end the game
      const { gameId, txnDigest } = req.body;

      // get vrf input
      const vrfInput = await GameService.getVRFInputInHex(gameId);

      // register (@TODO: check if this is used)
      console.log("registering game with id:", gameId);
      let registered = GameService.registerGame(gameId, txnDigest);

      // sign game
      console.log("signing game with id:", gameId);
      const blsSig = await services.BlsService.sign(vrfInput);

      // end game
      console.log("ending game with id:", gameId);
      let { playerWon, transactionDigest } = await GameService.finish_game(
        gameId,
        blsSig
      );
      res.status(200);
      res.json({
        playerWon,
        transactionDigest,
      });
    } catch (err) {
      console.error(
        `Bad things have happened while calling /game/play with id "${req.body.gameId}":`,
        err
      );
      // Forward the error to the error handler
      res.status(500);
      next(err);
    }
  }
);

// router.post(
//   "/single/end",
//   checkSinglePlayerEnd,
//   async (req: Request, res: Response, next: NextFunction) => {
//     console.log("POST /game/single/end with body:", req.body);

//     try {
//       let { playerWon, transactionDigest } = await GameService.finish_game(
//         req.body.gameId,
//         req.body.blsSig
//       );
//       res.status(200);
//       res.json({
//         playerWon,
//         transactionDigest,
//       });
//     } catch (e) {
//       console.error(
//         `Bad things have happened while calling /game/single/end with id "${req.body.gameId}":`,
//         e
//       );
//       // Forward the error to the error handler
//       res.status(500);
//       next(e);
//     }
//   }
// );

router.post(
  "/sign",
  checkSign,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sig = await services.BlsService.sign(req?.body?.gameId);

      res.status(200);
      res.json({
        blsSig: Array.from(sig),
      });
    } catch (e) {
      console.error(
        `Error creating bls signature for gameId ${req.body.gameId}`,
        e
      );
      res.status(500);
      next(e);
    }
  }
);

router.post(
  "/verify",
  checkVerify,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const valid = await services.BlsService.verify(
        req?.body?.msg,
        JSON.parse(req?.body?.sig)
      );
      res.status(200);
      res.json({
        valid,
      });
    } catch (e) {
      console.error(
        `Error verifying bls signature for msg ${req.body.msg} and sig ${req.body.sig}`,
        e
      );
      res.status(500);
      next(e);
    }
  }
);

export default router;
