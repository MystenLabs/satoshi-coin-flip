// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { enokiClient } from '../lib/enokiClient';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { digest, signature } = req.body;

    if (!digest || !signature) {
      return res.status(400).json({
        error: 'Missing required fields: digest, signature'
      });
    }

    const executionResult = await enokiClient.executeSponsoredTransaction({
      digest,
      signature,
    });

    return res.status(200).json({
      digest: executionResult.digest,
    });
  } catch (error) {
    console.error('Execution failed:', error);
    return res.status(500).json({ error: 'Execution failed' });
  }
}