// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enokiClient } from '../lib/enokiClient.js';
import { serverConfig } from '../lib/config.js';
import getMoveTarget from '../lib/getMoveTarget.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transactionKindBytes, sender } = req.body;

    if (!transactionKindBytes || !sender) {
      return res.status(400).json({
        error: 'Missing required fields: transactionKindBytes, sender'
      });
    }

    const sponsored = await enokiClient.createSponsoredTransaction({
      network: serverConfig.SUI_NETWORK_NAME as any,
      transactionKindBytes,
      sender: sender,
      allowedAddresses: [sender],
      allowedMoveCallTargets: [
        // Satoshi coin flip game functions
        getMoveTarget('single_player_satoshi', 'start_game'),
        getMoveTarget('single_player_satoshi', 'finish_game'),
        getMoveTarget('house_data', 'top_up'),
        getMoveTarget('house_data', 'withdraw'),
        // Standard transfer function
        '0x2::transfer::transfer',
        '0x2::coin::split',
        '0x2::coin::join',
      ],
    });

    return res.status(200).json({
      bytes: sponsored.bytes,
      digest: sponsored.digest,
    });
  } catch (error) {
    console.error('Sponsorship failed:', error);
    return res.status(500).json({ error: 'Sponsorship failed' });
  }
}