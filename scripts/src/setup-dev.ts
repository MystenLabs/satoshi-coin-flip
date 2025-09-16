import { SuiClient, getFullnodeUrl } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { fromB64, toB64 } from "@mysten/sui.js/utils";

import {
  packageId,
  houseCap,
  SUI_NETWORK,
  adminKey,
  SATOSHI_HOME_ADDRESS,
} from "./config";

import fs from "fs";

let privateKeyArray = Uint8Array.from(Array.from(fromB64(adminKey!)));

const keypairAdmin = Ed25519Keypair.fromSecretKey(privateKeyArray.slice(1));

console.log("Connecting to ", SUI_NETWORK);
let provider = new SuiClient({
  url: SUI_NETWORK,
});

const admin = SATOSHI_HOME_ADDRESS;

console.log("SUI_NETWORK = ", SUI_NETWORK);

if (SUI_NETWORK.endsWith("localhost:9000")) {
  provider = new SuiClient({ url: getFullnodeUrl("localnet") });
} else if (SUI_NETWORK.includes("testnet")) {
} else if (SUI_NETWORK.includes("mainnet")) {
}

console.log("Admin Address = " + admin);
console.log("Package ID  = " + packageId);
console.log("House Cap  = " + houseCap);

const initHouseBalance = 1_000_000_000_000; // 1k SUI

const tx = new TransactionBlock();

initializeContract();

//---------------------------------------------------------
/// Method Definitions
//---------------------------------------------------------

function initializeContract() {
  const houseCoin = tx.splitCoins(tx.gas, [tx.pure(initHouseBalance)]);

  tx.moveCall({
    target: `${packageId}::house_data::initialize_house_data`,
    arguments: [
      tx.object(houseCap),
      houseCoin,
    ],
  });
}

//---------------------------------------------------------
/// Execute Transaction
//---------------------------------------------------------

tx.setGasBudget(1500000000);

if (SUI_NETWORK.includes("mainnet")) {
  tx.setSenderIfNotSet(SATOSHI_HOME_ADDRESS as string);

  tx.build({ client: provider }).then((bytes) => {
    console.log("serialized_setup_tx bytes = ", bytes);
    let serializedBase64 = toB64(bytes);
    fs.writeFileSync("./serialized_setup_tx.txt", serializedBase64);
  });
} else {
  provider
    .signAndExecuteTransactionBlock({
      transactionBlock: tx,
      signer: keypairAdmin,
      requestType: "WaitForLocalExecution",
      options: {
        showObjectChanges: true,
        showEffects: true,
      },
    })
    .then(function (res) {
      const status = res?.effects?.status.status;

      console.log("executed! status = ", status);
      if (status === "success") {
        fs.writeFileSync("./tx_res.json", JSON.stringify(res));

        res?.objectChanges?.find((obj) => {
          if (
            obj.type === "created" &&
            obj.objectType.endsWith("house_data::HouseData")
          ) {
            console.log("HOUSE_DATA_ID=", obj.objectId);
          }
        });
        process.exit(0);
      }
      if (status == "failure") {
        console.log("Error = ", res?.effects);
        process.exit(1);
      }
    });
}

//---------------------------------------------------------
/// Helper Functions
//---------------------------------------------------------

// BLS signature functions removed - no longer needed with on-chain randomness
