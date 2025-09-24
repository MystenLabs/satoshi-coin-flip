#!/bin/bash

# check dependencies are available.
for i in jq curl sui; do
  if ! command -V ${i} 2>/dev/null; then
    echo "${i} is not installed"
    exit 1
  fi
done

NETWORK=http://localhost:9000
# API is now integrated into the frontend app
FRONTEND_BASE_URL=http://localhost:5173
FAUCET=https://localhost:9000/gas
suffix=""

if [ $# -eq 0 ]; then
  switched=$(sui client switch --env localnet)
    suffix=".local"
fi

if [ $# -ne 0 ]; then
  if [ $1 = "testnet" ]; then
    NETWORK="https://satoshi-coinflip-rpc.testnet.sui.io"
    FAUCET="https://faucet.testnet.sui.io/gas"
    FRONTEND_BASE_URL=https://satoshi-flip.mystenlabs.com
    switched=$(sui client switch --env testnet)
    suffix=".production"
  fi
  if [ $1 = "devnet" ]; then
    NETWORK="https://rpc.devnet.sui.io:443"
    FAUCET="https://faucet.devnet.sui.io/gas"
    FRONTEND_BASE_URL=https://api-devnet.satoshi.sui.io
    switched=$(sui client switch --env devnet)
  fi
fi

echo "- ${switched}"

#echo "- Admin Address is: ${SATOSHI_HOME_ADDRESS}"
#
#switch_res=$(sui client switch --address ${SATOSHI_HOME_ADDRESS})

#faucet_res=$(curl --location --request POST "$FAUCET" --header 'Content-Type: application/json' --data-raw '{"FixedAmountRequest": { "recipient": '$ADMIN_ADDRESS'}}')

publish_res=$(sui client publish --skip-fetch-latest-git-deps --gas-budget 2000000000 --json ../satoshi_flip)

echo ${publish_res} >.publish.res.json

# Check if the command succeeded (exit status 0)
if [[ "$publish_res" =~ "error" ]]; then
  # If yes, print the error message and exit the script
  echo "Error during move contract publishing.  Details : $publish_res"
  exit 1
fi

PACKAGE_ID=$(echo "${publish_res}" | jq -r '.effects.created[] | select(.owner == "Immutable").reference.objectId')

newObjs=$(echo "$publish_res" | jq -r '.objectChanges[] | select(.type == "created")')

HOUSE_CAP_ID=$(echo "$newObjs" | jq -r 'select (.objectType | contains("::house_data::HouseCap")).objectId')

SATOSHI_HOME_ADDRESS=$(sui client active-address)
SATOSHI_HOME_PRIVATE_KEY_BECH32=$(sui keytool export --key-identity "${SATOSHI_HOME_ADDRESS}" --json | jq -r .exportedPrivateKey)
SATOSHI_HOME_PRIVATE_KEY="$(sui keytool convert "${SATOSHI_HOME_PRIVATE_KEY_BECH32}" --json | jq -r .base64WithFlag)"

cat >.env.local<<-API_ENV
SUI_NETWORK=$NETWORK
SATOSHI_HOME_ADDRESS=$SATOSHI_HOME_ADDRESS
SATOSHI_HOME_PRIVATE_KEY=$SATOSHI_HOME_PRIVATE_KEY
PACKAGE_ADDRESS=$PACKAGE_ID
HOUSE_CAP=$HOUSE_CAP_ID
API_ENV

cat >../app/.env.local$suffix<<-VITE_API_ENV
VITE_SUI_NETWORK=$NETWORK
VITE_PACKAGE_ID=$PACKAGE_ID
VITE_BACKEND_API=$FRONTEND_BASE_URL
VITE_HOUSE_DATA=
VITE_FAUCET_API=https://pocs-faucet.vercel.app
VITE_ENOKI_API_KEY=
VITE_API_ENV

# API environment setup removed - API is now integrated into the app


echo "Satoshi Contract Deployment finished!"


echo "Proceeding with Script execution for contract Initialization..."


setup_result=$(npm run setup)

if [[ "$?" = 1 ]]; then
  # If yes, print the error message and exit the script
  echo "Error during setup script execution.  Details : $setup_result"
  exit 1
else

  echo "Setup script execution completed. Updating .env file with HouseData contract address..."

  tx_res=$(cat "tx_res.json")
  newObjects=$(echo "${tx_res}" | jq -r '.objectChanges[] | select(.type == "created")')
  HOUSE_DATA_ID=$(echo "$newObjects" | jq -r 'select (.objectType | contains("house_data::HouseData")).objectId')

  echo "HOUSE_DATA=$HOUSE_DATA_ID" >> ".env.local"
  echo "VITE_HOUSE_DATA=$HOUSE_DATA_ID" >> "../app/.env.local$suffix"

  echo "Contract Initialization Process finished!"
fi

