// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiClient } from "@mysten/sui.js/client";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64, MIST_PER_SUI } from "@mysten/sui.js/utils";

type CoinData = {
  version: string;
  digest: string;
  coinType: string;
  previousTransaction: string;
  coinObjectId: string;
  balance: string;
  lockedUntilEpoch?: number | null | undefined;
}[];

class SuiService {
  private _client: SuiClient;
  private _keypair: Ed25519Keypair;
  private gasCoins: any[];

  constructor() {
    console.log(
      "Generating Sui Service. Target Sui Node URL: ",
      process.env.SUI_NETWORK
    );
    // const keypair = Ed25519Keypair.deriveKeypair(phrase!)
    // @todo: parameterized initialization here?
    this._client = new SuiClient({ url: process.env.SUI_NETWORK! });
    this._keypair = this.createKeypair();
    this.gasCoins = [];
    this.populateGasCoins();
  }

  private createKeypair(): Ed25519Keypair {
    let privKeyArray = Uint8Array.from(
      Array.from(fromB64(process.env.SATOSHI_HOME_PRIVATE_KEY!))
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

  // public async hasBlockSynced(digest: string) {
  //   if (!digest) throw new Error("Invalid txn digest");

  //   try {
  //     let resp = await this.waitForTransactionBlock({
  //       timeout: 20000,
  //       digest,
  //       options: { showEffects: true },
  //     });

  //     return resp?.effects?.status.status === "success";
  //   } catch (e) {
  //     console.error("sync error", e);
  //     return false;
  //   }
  // }

  private async getCoinsAllPages(nextCursor: string = ""): Promise<CoinData> {
    let allCoins: CoinData = [];
    let homeAddress = process.env.SATOSHI_HOME_ADDRESS;

    let getCoinsInput = {
      owner: homeAddress!,
    };

    if (nextCursor) Object.assign(getCoinsInput, { cursor: nextCursor });

    return this.client.getCoins(getCoinsInput).then(async (res) => {
      let nextPageData: CoinData = [];
      if (res.hasNextPage && typeof res?.nextCursor === "string") {
        console.log(
          `Looking for coins in ${
            nextCursor ? "page with cursor " + nextCursor : "first page"
          }`
        );
        nextPageData = await this.getCoinsAllPages(res.nextCursor);
      }

      for (let coin of res.data) {
        allCoins.push(coin);
      }
      return allCoins.concat(nextPageData);
    });
  }

  private async populateGasCoins() {
    const maxTargetBalance = 0.01 * Number(MIST_PER_SUI);
    const minTargetBalance = 0.008 * Number(MIST_PER_SUI);
    try {
      let homeAddress = process.env.SATOSHI_HOME_ADDRESS;
      console.log("Fetching coins for :", homeAddress);
      const gasCoins = await this.getCoinsAllPages();

      this.gasCoins = gasCoins.filter(
        ({ balance }) =>
          minTargetBalance <= Number(balance) &&
          Number(balance) <= maxTargetBalance
      );

      console.log("Total gas coins found:", this.gasCoins.length);
    } catch (e) {
      console.error("Populating gas coins failed: ", e);
    }
  }

  public async getObject(objectId: string) {
    //: Promise<GetObjectDataResponse> {
    return this.client.getObject({
      id: objectId,
      options: {
        showContent: true,
      },
    });
  }

  public async getGasCoin() {
    console.log("getting gas coin for transaction");
    if (!this.gasCoins.length) {
      // We can not call this, because if it is triggered while its already populating
      // we are going to trigger a lot of concurent requests towards the FN
      // which is asking for a timeout.
      // Retrieving all the pages right now takes more than 5min
      // await this.populateGasCoins();
      console.log("No more gas coins or initialization not finished yet!");
    }

    // get the last gas coin from the array
    console.log("getting gas coin from array");

    let selectedGasCoin = this.gasCoins.pop();
    let isLatestVersion = await this.gasCoinIsLatestVersion(selectedGasCoin);
    console.log("remaining gas coins", this.gasCoins.length);

    // while the version of the gas coin is not the latest one in the chain, get another one from the array
    while (!isLatestVersion) {
      selectedGasCoin = this.gasCoins.pop();
      if (!selectedGasCoin) {
        break;
      }
      console.log("remaining gas coins", this.gasCoins.length);
    }

    return selectedGasCoin;
  }

  private async gasCoinIsLatestVersion(gasCoin: any) {
    const gasCoinVersion = gasCoin.version;
    console.log("checking if gas coin is latest version", gasCoin);
    const gasCoinObjectId = gasCoin.coinObjectId;
    try {
      const gasCoinOnChain = await this.client.getObject({
        id: gasCoinObjectId,
      });
      console.log({ gasCoinOnChain });
      const isLatestVersion = gasCoinOnChain.data?.version === gasCoinVersion;
      console.log("is latest version:", isLatestVersion);
      return isLatestVersion;
    } catch (e) {
      console.error("Error getting gas coin from chain: ", e);
      return false;
    }
  }

  /**
   * Wait for a transaction block result to be available over the API.
   * This can be used in conjunction with `executeTransactionBlock` to wait for the transaction to
   * be available via the API.
   * This currently polls the `getTransactionBlock` API to check for the transaction.
   */
  // async waitForTransactionBlock({
  //   signal,
  //   timeout = 60 * 1000,
  //   pollInterval = 2 * 1000,
  //   ...input
  // }: {
  //   /** An optional abort signal that can be used to cancel */
  //   signal?: AbortSignal;
  //   /** The amount of time to wait for a transaction block. Defaults to one minute. */
  //   timeout?: number;
  //   /** The amount of time to wait between checks for the transaction block. Defaults to 2 seconds. */
  //   pollInterval?: number;
  // } & Parameters<
  //   JsonRpcProvider["getTransactionBlock"]
  // >[0]): Promise<SuiTransactionBlockResponse> {
  //   let blockRetrieved = false;
  //   const timeoutSignal = AbortSignal.timeout(timeout);
  //   const timeoutPromise = new Promise((_, reject) => {
  //     timeoutSignal.addEventListener("abort", () => {
  //       if (!blockRetrieved) reject(timeoutSignal.reason);
  //     });
  //   });

  //   // let index = 0;
  //   while (!timeoutSignal.aborted && !blockRetrieved) {
  //     signal?.throwIfAborted();
  //     try {
  //       // test failing scenario
  //       // while (index < 3) {
  //       //   index ++;
  //       //   throw new Error("Simulating an error thrown");
  //       // }
  //       let sync = await this.provider.getTransactionBlock(input);
  //       if (sync.effects?.status.status === "success") blockRetrieved = true;
  //       return sync;
  //     } catch (e) {
  //       console.log("error?", e);
  //       // Wait for either the next poll interval, or the timeout.
  //       await Promise.race([
  //         new Promise((resolve) => setTimeout(resolve, pollInterval)),
  //         timeoutPromise,
  //       ]);
  //     }
  //   }

  //   timeoutSignal.throwIfAborted();

  //   // This should never happen, because the above case should always throw, but just adding it in the event that something goes horribly wrong.
  //   throw new Error("Unexpected error while waiting for transaction block.");
  // }
}

export { SuiService }; //, SuiServiceInterface };
