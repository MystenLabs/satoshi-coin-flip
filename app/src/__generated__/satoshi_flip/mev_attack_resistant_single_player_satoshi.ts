/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * This module implements a single player Satoshi Flip game that is resistant to
 * MEV attacks. Operates in a similar manner to single_player_satoshi_flip, but
 * with the addition of a guess submission step.
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './deps/sui/object.js';
import * as balance from './deps/sui/balance.js';
const $moduleName = '@local-pkg/satoshi-flip::mev_attack_resistant_single_player_satoshi';
export const NewGame = new MoveStruct({ name: `${$moduleName}::NewGame`, fields: {
        game_id: bcs.Address,
        player: bcs.Address,
        guess: bcs.string(),
        user_stake: bcs.u64(),
        fee_bp: bcs.u16()
    } });
export const Outcome = new MoveStruct({ name: `${$moduleName}::Outcome`, fields: {
        game_id: bcs.Address,
        status: bcs.u8()
    } });
export const Game = new MoveStruct({ name: `${$moduleName}::Game`, fields: {
        id: object.UID,
        guess_placed_epoch: bcs.option(bcs.u64()),
        total_stake: balance.Balance,
        guess: bcs.option(bcs.string()),
        player: bcs.Address,
        fee_bp: bcs.u16(),
        status: bcs.u8()
    } });
export interface CreateGameAndSubmitStakeArguments {
    houseData: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
}
export interface CreateGameAndSubmitStakeOptions {
    package?: string;
    arguments: CreateGameAndSubmitStakeArguments | [
        houseData: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>
    ];
}
/**
 * Function used to create a new game. Stake is taken from the player's coin and
 * added to the game's stake. The house's stake is also added to the game's stake.
 */
export function createGameAndSubmitStake(options: CreateGameAndSubmitStakeOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
    ] satisfies string[];
    const parameterNames = ["houseData", "coin"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'create_game_and_submit_stake',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface SubmitGuessArguments {
    houseData: RawTransactionArgument<string>;
    gameId: RawTransactionArgument<string>;
    guess: RawTransactionArgument<string>;
}
export interface SubmitGuessOptions {
    package?: string;
    arguments: SubmitGuessArguments | [
        houseData: RawTransactionArgument<string>,
        gameId: RawTransactionArgument<string>,
        guess: RawTransactionArgument<string>
    ];
}
/**
 * Function used to submit the player's guess. Requires that the player has already
 * submitted the stake.
 */
export function submitGuess(options: SubmitGuessOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000001::string::String'
    ] satisfies string[];
    const parameterNames = ["houseData", "gameId", "guess"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'submit_guess',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FinishGameArguments {
    houseData: RawTransactionArgument<string>;
    gameId: RawTransactionArgument<string>;
}
export interface FinishGameOptions {
    package?: string;
    arguments: FinishGameArguments | [
        houseData: RawTransactionArgument<string>,
        gameId: RawTransactionArgument<string>
    ];
}
/**
 * Function that determines the winner and distributes the funds accordingly. If
 * the player wins and fees are = 0, the entire stake balance is transferred to the
 * player. If the player wins and fees are > 0, the fees are taken from the stake
 * balance and transferred to the house before transferring the rewards to the
 * player. If house wins, the entire stake balance is transferred to the
 * house_data's balance field. Anyone can end the game (game & house_data objects
 * are shared). Uses Sui's native randomness for secure, trustless random number
 * generation. An Outcome event is emitted to signal that the game has ended.
 */
export function finishGame(options: FinishGameOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID',
        '0x0000000000000000000000000000000000000000000000000000000000000002::random::Random'
    ] satisfies string[];
    const parameterNames = ["houseData", "gameId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'finish_game',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface DisputeAndWinArguments {
    houseData: RawTransactionArgument<string>;
    gameId: RawTransactionArgument<string>;
}
export interface DisputeAndWinOptions {
    package?: string;
    arguments: DisputeAndWinArguments | [
        houseData: RawTransactionArgument<string>,
        gameId: RawTransactionArgument<string>
    ];
}
/**
 * Function used to cancel a game after EPOCHS_CANCEL_AFTER epochs have passed. Can
 * be called by anyone. On successful execution the entire game stake is returned
 * to the player.
 */
export function disputeAndWin(options: DisputeAndWinOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["houseData", "gameId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'dispute_and_win',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GuessPlacedEpochArguments {
    game: RawTransactionArgument<string>;
}
export interface GuessPlacedEpochOptions {
    package?: string;
    arguments: GuessPlacedEpochArguments | [
        game: RawTransactionArgument<string>
    ];
}
/** Returns the epoch in which the guess was placed. */
export function guessPlacedEpoch(options: GuessPlacedEpochOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::mev_attack_resistant_single_player_satoshi::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'guess_placed_epoch',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface StakeArguments {
    game: RawTransactionArgument<string>;
}
export interface StakeOptions {
    package?: string;
    arguments: StakeArguments | [
        game: RawTransactionArgument<string>
    ];
}
/** Returns the total stake. */
export function stake(options: StakeOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::mev_attack_resistant_single_player_satoshi::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'stake',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GuessArguments {
    game: RawTransactionArgument<string>;
}
export interface GuessOptions {
    package?: string;
    arguments: GuessArguments | [
        game: RawTransactionArgument<string>
    ];
}
/** Returns the player's guess. */
export function guess(options: GuessOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::mev_attack_resistant_single_player_satoshi::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'guess',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface PlayerArguments {
    game: RawTransactionArgument<string>;
}
export interface PlayerOptions {
    package?: string;
    arguments: PlayerArguments | [
        game: RawTransactionArgument<string>
    ];
}
/** Returns the player's address. */
export function player(options: PlayerOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::mev_attack_resistant_single_player_satoshi::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'player',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FeeInBpArguments {
    game: RawTransactionArgument<string>;
}
export interface FeeInBpOptions {
    package?: string;
    arguments: FeeInBpArguments | [
        game: RawTransactionArgument<string>
    ];
}
/** Returns the fee of the game. */
export function feeInBp(options: FeeInBpOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::mev_attack_resistant_single_player_satoshi::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'fee_in_bp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface StatusArguments {
    game: RawTransactionArgument<string>;
}
export interface StatusOptions {
    package?: string;
    arguments: StatusArguments | [
        game: RawTransactionArgument<string>
    ];
}
/** Returns the status of the game. */
export function status(options: StatusOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::mev_attack_resistant_single_player_satoshi::Game`
    ] satisfies string[];
    const parameterNames = ["game"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'status',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FeeAmountArguments {
    gameStake: RawTransactionArgument<number | bigint>;
    feeInBp: RawTransactionArgument<number>;
}
export interface FeeAmountOptions {
    package?: string;
    arguments: FeeAmountArguments | [
        gameStake: RawTransactionArgument<number | bigint>,
        feeInBp: RawTransactionArgument<number>
    ];
}
/**
 * Helper function to calculate the amount of fees to be paid. Fees are only
 * applied on the player's stake.
 */
export function feeAmount(options: FeeAmountOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        'u64',
        'u16'
    ] satisfies string[];
    const parameterNames = ["gameStake", "feeInBp"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'fee_amount',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface GameExistsArguments {
    houseData: RawTransactionArgument<string>;
    gameId: RawTransactionArgument<string>;
}
export interface GameExistsOptions {
    package?: string;
    arguments: GameExistsArguments | [
        houseData: RawTransactionArgument<string>,
        gameId: RawTransactionArgument<string>
    ];
}
/** Helper function to check if a game exists. */
export function gameExists(options: GameExistsOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["houseData", "gameId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'game_exists',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface BorrowGameArguments {
    houseData: RawTransactionArgument<string>;
    gameId: RawTransactionArgument<string>;
}
export interface BorrowGameOptions {
    package?: string;
    arguments: BorrowGameArguments | [
        houseData: RawTransactionArgument<string>,
        gameId: RawTransactionArgument<string>
    ];
}
/**
 * Helper function to check that a game exists and return a reference to the game
 * Object.
 */
export function borrowGame(options: BorrowGameOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::object::ID'
    ] satisfies string[];
    const parameterNames = ["houseData", "gameId"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'mev_attack_resistant_single_player_satoshi',
        function: 'borrow_game',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}