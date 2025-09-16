// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { VercelRequest, VercelResponse } from '@vercel/node';
import services from "../services/";

const GameService = services.SatoshiGameService;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("POST /api/game/play with body:", req.body);

  try {
    // Basic validation
    if (!req.body.gameId || !req.body.txnDigest) {
      return res.status(400).json({ error: 'Missing required fields: gameId, txnDigest' });
    }

    // register and end the game (no more signing needed with on-chain randomness)
    const { gameId, txnDigest } = req.body;

    // register (@TODO: check if this is used)
    console.log("registering game with id:", gameId);
    let registered = GameService.registerGame(gameId, txnDigest);

    // end game using on-chain randomness
    console.log("ending game with id:", gameId);
    let { playerWon, transactionDigest } = await GameService.finish_game(
      gameId
    );
    res.status(200).json({
      playerWon,
      transactionDigest,
    });
  } catch (err) {
    console.error(
      `Bad things have happened while calling /api/game/play with id "${req.body.gameId}":`,
      err
    );
    res.status(500).json({ error: 'Internal server error' });
  }
}