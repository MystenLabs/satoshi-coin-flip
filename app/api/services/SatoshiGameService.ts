// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

class SatoshiGameService {
  private readonly gameIdMap: Map<
    string,
    {
      txn_digest: string;
      date_created: string;
      game_ended: boolean;
      player_won: boolean | null;
      date_ended: string | null;
    }
  > = new Map<
    string,
    {
      txn_digest: string;
      date_created: string;
      game_ended: boolean;
      player_won: boolean | null;
      date_ended: string | null;
    }
  >();

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

}

export default SatoshiGameService;
