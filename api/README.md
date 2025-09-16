# Satoshi Server

The Satoshi API is responsible for making sensitive Sui module calls.

You can find Postman collection with available calls and sample responses [api folder](./Satoshi%20Flip%20endpoints.postman_collection.json). It also contains endpoints of the previous satoshi smart contract implementation that can be seen in [satoshi_flip](./../satoshi_flip/sources/single_player_satoshi.move).

The server includes the following endpoints:

- `POST /game/register` - Called after a user has created a new game. Registers the new game in the api storage. Used for tracking game status and to perform checks.
- `POST /game/single/end` - Ends a game by calling the `play` method of the single_player_satoshi module. Handles coin object equivocation with a round robin approach.
- `GET /game/details` - Returns deails about all games that were created since the API started running
- `POST /game/sign` - Signs a message with the house's private key
- `POST /game/verify` - Verifies that a message was signed by the house's private key

## Prerequisites

You must have the following prerequisites installed to successfully use the example:

- Node 18 installed locally
- Sui Client CLI (installed when you install Sui)
- Successful execution of the `./../scripts/publish.sh` [initialization script](./../scripts/README.md)

## Local Execution

Follow these steps to get started with the example:

1.  Navigate to the /api folder in the repo and run `npm install`
2.  Run `npm run dev` in this folder to start a local server. This uses the `.env.local` file to configure the server.

## Docker Support

To start api in docker container, run `docker-compose up` in the /api folder.
