// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { VercelRequest, VercelResponse } from '@vercel/node';
import services from "../services/";

const GameService = services.SatoshiGameService;

export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  console.log("GET /api/game/details");

  try {
    let games = GameService.getGames();
    res.status(200).json({
      games,
    });
  } catch (e) {
    console.error(`Bad things have happened while calling /api/game/details:`, e);
    res.status(500).json({ error: 'Internal server error' });
  }
}