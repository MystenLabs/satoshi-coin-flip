// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiClient } from "@mysten/sui/client";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { fromBase64 } from "@mysten/sui/utils";

class SuiService {
  private readonly _client: SuiClient;
  private readonly _keypair: Ed25519Keypair;

  constructor() {
    console.log(
      "Generating Sui Service. Target Sui Node URL: ",
      process.env.SUI_NETWORK
    );
    this._client = new SuiClient({ url: process.env.SUI_NETWORK! });
    this._keypair = this.createKeypair();
  }

  private createKeypair(): Ed25519Keypair {
    let privKeyArray = Uint8Array.from(
      Array.from(fromBase64(process.env.SATOSHI_HOME_PRIVATE_KEY!))
    );

    const keypair = Ed25519Keypair.fromSecretKey(
      Uint8Array.from(privKeyArray).slice(1)
    );

    return keypair;
  }

  get keypair() {
    return this._keypair;
  }

  get client() {
    return this._client;
  }
}

export { SuiService };
