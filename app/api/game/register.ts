// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { VercelRequest, VercelResponse } from '@vercel/node';
import services from "../services/";

const GameService = services.SatoshiGameService;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("POST /api/game/register with body:", req.body);

  try {
    // Basic validation
    if (!req.body.gameId || !req.body.txnDigest) {
      return res.status(400).json({ error: 'Missing required fields: gameId, txnDigest' });
    }

    let registered = GameService.registerGame(
      req.body.gameId,
      req.body.txnDigest
    );
    res.status(200).json({
      registered,
    });
  } catch (e) {
    console.error(
      `Bad things have happened while calling /api/game/register with id "${req.body.gameId}":`,
      e
    );
    res.status(500).json({ error: 'Internal server error' });
  }
}