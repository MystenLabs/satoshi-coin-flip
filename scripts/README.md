# Set up scripts

This folder contains scripts that utilize the SuiClient CLI and Linux Bash commands to initialize the project configuration and deploy the satoshi_coin_flip module.

### Local Deployment
- Export the address of the Con Flip "House" Account as an Environment Variable by running: `export SATOSHI_HOME_ADDRESS="your address here"`
- Export the Private Key in Base64 format of the Con Flip "House" Account as an Environment Variable by running: `export SATOSHI_HOME_PRIVATE_KEY="your key in Base64"`
- Make sure that `SATOSHI_HOME_ADDRESS` has sufficient coin balance
- Run the deployment script: `./publish.sh`


### Testnet | Devnet Deployment
- Export the address of the Con Flip "House" **testnet | devnet** Account as an Environment Variable by running: `export SATOSHI_HOME_ADDRESS="your address here"`
- Export the Private Key in Base64 format of the Con Flip "House" **testnet | devnet** Account as an Environment Variable by running: `export SATOSHI_HOME_PRIVATE_KEY="your key in Base64"`

- Make sure that the `SATOSHI_HOME_ADDRESS` address has sufficient sui coins 
- Run `./publish testnet | devnet`. To deploy the contract to the testnet | devnet Sui Environment respectively.


## The publish script will:
- Switch to the `testnet | devnet` environment
- Switch to the `SATOSHI_HOME_ADDRESS` as the current active address
- Deploy the contract to the Sui Environment
- Populate the .env files in the `api` and `app` folders
- Run the initialization script.


## Prerequisites

 - Node v16.18 or similar
 - **(For dev environment only)** Sui Client CLI (installed when you install SUI)
 - **(For dev environment only)** An active address in the Sui Client CLI with enough SUI or MIST to participate in the game. The example uses 5000 MIST. You can add SUI to your address using the Discord [#devnet-faucet](https://discord.com/channels/916379725201563759/971488439931392130) channel, or use the `requestSuiFromFaucet` method of the JS /TS SDK.
 - **(For dev environment only)** The active address must be the first address that appears when listing keytool information with `sui keytool list`, and it must use the ed25519 key scheme.
