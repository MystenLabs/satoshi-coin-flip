# Time-locked Satoshi Coin Flip

We present a fair method to use the Sui blockchain to conduct a 50 / 50 game of chance. We model the example after a 2-sided coin flip with a 50% chance for each outcome, Tails or Heads.

Kostas Chalkias, Chief Cryptographer at Mysten Labs, presented the theory behind this project at [GAM3R 2022](https://docs.google.com/presentation/d/1a9wddWhqKM4GXMV1UrhrpaH1sBMUxZWI/edit?usp=sharing&ouid=110032463750803153525&rtpof=true&sd=true).

## Satoshi Coin Flip Modules

### `house_data.move`
Creates a singleton house data object and provides a method to initialize it with the house's public key and funds.<br/>
This object is used in all game related operations.<br/>
It also defines game restrictions such as min and max allowed stake.<br/>
Operates as the house's treasury object that contains the house's staking balance as well as the fees collected from the games.<br/>

### `counter_nft.move`
This module defines the Counter NFT object and provides methods to create and increment it.<br/>
The Counter NFT is used as the VRF input for every game that a player plays.<br/>
The count always increases after use, ensuring a unique input for every game.<br/>
A player is required to create a Counter NFT before playing their first game.<br/>
The UI can seemlessly create the Counter NFT for the user by including the counter creation along with the game creation function in the same PTB.

### `single_player_satoshi.move`
Defines the game object and provides methods to create, end and dispute a game.

### `mev_attack_resistant_single_player_satoshi.move`
Similar to the `single_player_satoshi` module, but with the addition of the `submit_guess` function that is used to submit the guess and VRF input in a separate transaction.<br/>
It also enforces status checks to ensure that the game is in the correct state before submit, end and dispute functions are called. <br/>
More details about the differences between the two versions can be found in the [Satoshi Coin Flip Flavors](#satoshi-coin-flip-flavors) section.
## Satoshi Coin Flip Flavors

This repo contains two versions of the Satoshi Coin Flip contract. This enables use cases to implement whichever approach fits them best. UX and security have to be weighted in order to take an informed decision. 

The two versions are:
1. [**Single Player Satoshi**](#single-player-satoshi-smart-contract-flow): Provides better UX (1 user transaction per game) but is not as secure against a specific MEV attack (explained in the [MEV attack](#the-mev-attack) section).
1. [**MEV attack resistant Single Player Satoshi**](#mev-attack-resistant-single-player-satoshi-smart-contract-flow): Provides slightly worse UX (2 user transactions per game) but is secure against the MEV attack.

### Single Player Satoshi: Smart Contract Flow

The smart contract works for any one player. An entity called house acts as the game's organizer. A treasury object is used to submit the house's stake and is managed by the contract creator. <br/>
Upon contract deployment, the house data are initialized with the house's public key. 

Prior to playing their first game, a user will be required to create a Counter NFT. <br/>
This can be achieved by including in a PTB the Counter NFT creation along with the game creation function. <br/>
Maintaining in this way a uniform UX for the user. <br/>
For any subsequent game, the Counter NFT can just be passed in the game creation function. <br/>
The Counter NFT's `ID` + `count` acts as the VRF input for every game that they play. <br/>
The count always increases after use, ensuring a unique input for every game.

The player that starts the game submits their Counter NFT along with their choice of Tails or Heads. The guess has been purposely declared as a string, H for Heads and T for Tails respectively, so that user can verify their choice upon signing. Additionally, at this stage the player's & house's stake is submitted.

Once the game has been created, anyone can end it by providing a valid BLS signature and the game id. The winner is determined by a bit of the hashed randomness beacon. The beacon is the result of BLS signing the `counterID` + `count` with the house's private key.

Fairness is ensured and verifiable by:
 1. Player can not guess the house's private key
 1. House can not predict the user's guess
 1. Time-locking the game so that it is obliged to end after X number of epochs (X=7 in our example).

#### Global Architecture Diagram
***Note:** The high level architecture remains the same for both Satoshi Coin Flip flavors.*

![Global Proposed Architecture](/diagrams/Global%20Architecture%20Diagram.png)

#### Single Player Satoshi: Sequence Diagram
![SPS Sequence Flow Diagram](/diagrams/sequence_sps.png)
### MEV attack resistant Single Player Satoshi: Smart Contract Flow

#### The MEV attack
In the above contract flow a malicious validator in cooperation with the house could front-run a user's new game transaction in order to drain the house's balance on player winning games. 

This is possible in the following way:
1. Player submits a transaction for execution with a winning guess. House is able to tell that this game is winning since the user provides stake, VRF inputs and their guess in the same transaction.
1. House realizes this and because they are working with a leading validator they can slow down this user transaction.
1. Before the user transaction gets to execute, the house executes a transaction to withdraw the house balance.
1. This causes the user's transaction to fail since it won't find sufficient house funds to submit for the new game.

#### The solution
The contract is very similar to the original with the addition of one step.
Instead of submitting the stake, VRF input and guess in the same transaction, we now do the following:
1. Player and house submit their stake and create a new game.
1. After this transaction has been verified by its effects & have confirmed that its block exists, the player then submits their guess along with the VRF input.
1. Finally, once the above steps we can normally end the game or dispute it like before.

**Why does the above flow solve the problem?**

Because the house no longer knows what the player is going to pick when the stake submition takes place. <br/>
The house has already submitted the stake in the first transaction and can no longer drain the house's balance. 
#### MEV Attack Resistant Single Player Satoshi: Sequence Diagram
![SPS Sequence Flow Diagram](/diagrams/sequence_mev_sps.png)
## Proposed UI Flows

The House assumes the role of the UI. Any player can join, connect a Sui-compatible wallet, and then start a new game by clicking **New Game**.

The player picks a Counter NFT and a coin of at least `X` MIST where `max_stake <= X <= min_stake`. This step can be abstracted from the player and chosen by the web application. The UI then asks the player to choose **Tails** or **Heads** (mapped internally as 0 or 1 respectively), to guess the predetermined bit. It then locks `X` MIST of the player's balance and another `X` MIST from the house's treasury.

***Note:** In the case of the MEV attack resistant version, the player will be asked to submit their guess and VRF input in a separate transaction than the funds sumbission transaction.*

To end the game, the House reveals the secret and then transfers `2*X` MIST to the winner, if `base_fee == 0`. If `base_fee > 0`, the House transfers `2*X - base_fee_amount` MIST to the winner and `base_fee_amount` MIST to the treasury.
This is achieved by implementing the proposed back-end service as seen in the next section.

The sample UI demonstrates our fairness claim: The human player can check the objects and transactions created on the chain at any point to verify that the signatures match and the outcome is correct and fair.

## Proposed Back-end Service

For the purposes of signing and revealing the beacon the house's private key must be kept somewhere safe. For this reason we propose a back-end service that is capable of hiding the private key from end users and is able to cleverly determine when to reveal the beacon: only after a game has been created. This can be checked by awaiting for the transaction block containing the gameId (or for the case of the MEV attack resistant version upon guess submission).

Another useful aspect of the back-end is to make the user experience better by initiating the end game transaction as the house. This way games that might not be closed can also be tracked and closed later with additional services  / cron jobs.

## Disclaimer

"Time-locked Satoshi Coin Flip" is intended to serve as general reference, is provided for informational purposes only and does not provide gambling endorsement, advice or recommendations. Users are responsible for their own gambling activities and decisions, including complying with applicable laws and regulations relating to gambling. We make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information provided by the "Time-locked Satoshi Coin Flip". We are not responsible for any legal consequences users of "Time-locked Satoshi Coin Flip" may face.

## License

"Time-locked Satoshi Coin Flip" is released under the [Apache 2.0 License](LICENSE).
