// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

// import { SuiService, SuiServiceInterface } from "./SuiService";
import { bytesToHex } from "@noble/hashes/utils";
import { SuiService } from "./SuiService";
import { TransactionBlock } from "@mysten/sui.js/transactions";

class SatoshiGameService {
  // private suiService: SuiServiceInterface;
  private suiService: SuiService;
  private gameIdMap: Map<
    String,
    {
      txn_digest: string;
      date_created: String;
      game_ended: boolean;
      player_won: boolean | null;
      date_ended: String | null;
    }
  > = new Map<
    String,
    {
      txn_digest: string;
      date_created: String;
      game_ended: boolean;
      player_won: boolean | null;
      date_ended: String | null;
    }
  >();

  constructor() {
    this.suiService = new SuiService();
  }

  public getGames() {
    let games: Object[] = [];
    for (let key of this.gameIdMap.keys()) {
      games.push({ gameId: key, details: this.gameIdMap.get(key) });
    }
    return games;
  }

  public registerGame(gameId: string, txn_digest: string) {
    try {
      this.gameIdMap.set(gameId, {
        txn_digest,
        date_created: new Date().toUTCString(),
        game_ended: false,
        player_won: null,
        date_ended: null,
      });
      return true;
    } catch (e) {
      console.error("Encountered error while registering game", e);
      return false;
    }
  }

  // This method is no longer needed with on-chain randomness
  // public async getVRFInputInHex(gameId: string): Promise<string> {
  //   let game: any = await this.suiService.getObject(gameId);
  //   let VRFInput = Uint8Array.from(game.data?.content.fields.vrf_input);
  //   let VRFInputInHex = bytesToHex(VRFInput);
  //   console.log("[getVRFInputInHex] - Output:", VRFInputInHex);
  //   return VRFInputInHex;
  // }

  // end-game for single player satoshi using on-chain randomness
  public finish_game(
    gameId: string
  ): Promise<{ playerWon: boolean; transactionDigest: string }> {
    return new Promise(async (resolve, reject) => {
      // Limiting the use of endGame call to only gameIds created within the scope of the application
      if (!this.gameIdMap.has(gameId)) {
        reject("Given gameId does not exist");
        return;
      }

      let txnDigest = this.gameIdMap.get(gameId)?.txn_digest;

      console.log(
        `Waiting for create game txn with digest ${txnDigest} to sync...`
      );
      // let hasSynced = await this.suiService.hasBlockSynced(txnDigest!);
      // console.log("Has synced", !!hasSynced);

      // if (!hasSynced) {
      //   return reject({
      //     status: "failure",
      //     message:
      //       "Timeout expired while waiting for full nodes to sync on the created game",
      //   });
      // }

      const gasCoin = await this.suiService.getGasCoin();
      if (gasCoin === undefined)
        return reject({
          status: "Hold",
          message: "Out of gas coins or populating...",
        });

      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${process.env.PACKAGE_ADDRESS}::single_player_satoshi::finish_game`,
        arguments: [
          tx.pure(gameId),
          tx.object(String(process.env.HOUSE_DATA)),
          tx.object("0x8"), // Random object
        ],
      });

      console.log("ending game with coin:", gasCoin);

      tx.setGasPayment([
        {
          objectId: gasCoin?.coinObjectId,
          version: gasCoin?.version,
          digest: gasCoin?.digest,
        },
      ]);

      this.suiService.client
        .signAndExecuteTransactionBlock({
          transactionBlock: tx,
          requestType: "WaitForLocalExecution",
          signer: this.suiService.keypair,
          options: {
            showEffects: true,
            showEvents: true,
          },
        })
        .then(async (res) => {
          const { effects, events } = res;
          const status = effects?.status?.status;
          const transactionDigest = effects?.transactionDigest!;
          console.log("end game digest", res.digest);
          if (status === "success") {
            const outcomeEvent = events?.find((event) =>
              event.type.includes("::Outcome")
            )?.parsedJson as { game_id: string; status: number };
            console.log("outcome event", outcomeEvent);

            const gameResult = {
              game_ended: true,
              player_won: outcomeEvent?.status === 1,
              guess: "N/A",
              date_ended: new Date().toUTCString(),
              date_created: this.gameIdMap.get(gameId)?.date_created || "N/A",
              txn_digest: txnDigest!,
            };
            console.log({ won: outcomeEvent?.status === 1 });
            this.gameIdMap.set(gameId, gameResult);
            resolve({
              playerWon: outcomeEvent?.status === 1,
              transactionDigest,
            });
          } else {
            reject({
              status: "failure",
              effects,
            });
          }
        })
        .catch((e) => {
          reject({
            status: "failure",
            message: e.message || "Transaction failed",
            originalError: e,
          });
        });
    });
  }
}

export default SatoshiGameService;
