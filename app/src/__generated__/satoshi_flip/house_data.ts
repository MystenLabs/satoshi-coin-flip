/**************************************************************
 * THIS FILE IS GENERATED AND SHOULD NOT BE MANUALLY MODIFIED *
 **************************************************************/


/**
 * An abstraction used to represent the house in a game of Satoshi Coin Flip. The
 * house is the entity that defines game restrictions and fees. All games reside
 * below the house as DoFs.
 */

import { MoveStruct, normalizeMoveArguments, type RawTransactionArgument } from '../utils/index.js';
import { bcs } from '@mysten/sui/bcs';
import { type Transaction } from '@mysten/sui/transactions';
import * as object from './deps/sui/object.js';
import * as balance_1 from './deps/sui/balance.js';
const $moduleName = '@local-pkg/satoshi-flip::house_data';
export const HouseData = new MoveStruct({ name: `${$moduleName}::HouseData`, fields: {
        id: object.UID,
        balance: balance_1.Balance,
        house: bcs.Address,
        max_stake: bcs.u64(),
        min_stake: bcs.u64(),
        fees: balance_1.Balance,
        base_fee_in_bp: bcs.u16()
    } });
export const HouseCap = new MoveStruct({ name: `${$moduleName}::HouseCap`, fields: {
        id: object.UID
    } });
export const HOUSE_DATA = new MoveStruct({ name: `${$moduleName}::HOUSE_DATA`, fields: {
        dummy_field: bcs.bool()
    } });
export interface InitializeHouseDataArguments {
    houseCap: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
}
export interface InitializeHouseDataOptions {
    package?: string;
    arguments: InitializeHouseDataArguments | [
        houseCap: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>
    ];
}
/**
 * Initializer function that should only be called once and by the creator of the
 * contract. Initializes the house data object with the house's public key and an
 * initial balance. It also sets the max and min stake values, that can later on be
 * updated. Stores the house address and the base fee in basis points. This object
 * is involed in all games created by the same instance of this package.
 */
export function initializeHouseData(options: InitializeHouseDataOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseCap`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
    ] satisfies string[];
    const parameterNames = ["houseCap", "coin"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'initialize_house_data',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface TopUpArguments {
    houseData: RawTransactionArgument<string>;
    coin: RawTransactionArgument<string>;
}
export interface TopUpOptions {
    package?: string;
    arguments: TopUpArguments | [
        houseData: RawTransactionArgument<string>,
        coin: RawTransactionArgument<string>
    ];
}
/**
 * Function used to top up the house balance. Can be called by anyone. House can
 * have multiple accounts so giving the treasury balance is not limited.
 */
export function topUp(options: TopUpOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        '0x0000000000000000000000000000000000000000000000000000000000000002::coin::Coin<0x0000000000000000000000000000000000000000000000000000000000000002::sui::SUI>'
    ] satisfies string[];
    const parameterNames = ["houseData", "coin"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'top_up',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface WithdrawArguments {
    houseData: RawTransactionArgument<string>;
}
export interface WithdrawOptions {
    package?: string;
    arguments: WithdrawArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/**
 * House can withdraw the entire balance of the house object. Caution should be
 * taken when calling this function. If all funds are withdrawn, it will result in
 * the house not being able to participate in any more games.
 */
export function withdraw(options: WithdrawOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'withdraw',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface ClaimFeesArguments {
    houseData: RawTransactionArgument<string>;
}
export interface ClaimFeesOptions {
    package?: string;
    arguments: ClaimFeesArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/** House can withdraw the accumulated fees of the house object. */
export function claimFees(options: ClaimFeesOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'claim_fees',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateMaxStakeArguments {
    houseData: RawTransactionArgument<string>;
    maxStake: RawTransactionArgument<number | bigint>;
}
export interface UpdateMaxStakeOptions {
    package?: string;
    arguments: UpdateMaxStakeArguments | [
        houseData: RawTransactionArgument<string>,
        maxStake: RawTransactionArgument<number | bigint>
    ];
}
/** House can update the max stake. This allows larger stake to be placed. */
export function updateMaxStake(options: UpdateMaxStakeOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["houseData", "maxStake"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'update_max_stake',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface UpdateMinStakeArguments {
    houseData: RawTransactionArgument<string>;
    minStake: RawTransactionArgument<number | bigint>;
}
export interface UpdateMinStakeOptions {
    package?: string;
    arguments: UpdateMinStakeArguments | [
        houseData: RawTransactionArgument<string>,
        minStake: RawTransactionArgument<number | bigint>
    ];
}
/** House can update the min stake. This allows smaller stake to be placed. */
export function updateMinStake(options: UpdateMinStakeOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`,
        'u64'
    ] satisfies string[];
    const parameterNames = ["houseData", "minStake"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'update_min_stake',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface BalanceArguments {
    houseData: RawTransactionArgument<string>;
}
export interface BalanceOptions {
    package?: string;
    arguments: BalanceArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/** Returns the balance of the house. */
export function balance(options: BalanceOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'balance',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface HouseArguments {
    houseData: RawTransactionArgument<string>;
}
export interface HouseOptions {
    package?: string;
    arguments: HouseArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/** Returns the address of the house. */
export function house(options: HouseOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'house',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MaxStakeArguments {
    houseData: RawTransactionArgument<string>;
}
export interface MaxStakeOptions {
    package?: string;
    arguments: MaxStakeArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/** Returns the max stake of the house. */
export function maxStake(options: MaxStakeOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'max_stake',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface MinStakeArguments {
    houseData: RawTransactionArgument<string>;
}
export interface MinStakeOptions {
    package?: string;
    arguments: MinStakeArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/** Returns the min stake of the house. */
export function minStake(options: MinStakeOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'min_stake',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface FeesArguments {
    houseData: RawTransactionArgument<string>;
}
export interface FeesOptions {
    package?: string;
    arguments: FeesArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/** Returns the fees of the house. */
export function fees(options: FeesOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'fees',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}
export interface BaseFeeInBpArguments {
    houseData: RawTransactionArgument<string>;
}
export interface BaseFeeInBpOptions {
    package?: string;
    arguments: BaseFeeInBpArguments | [
        houseData: RawTransactionArgument<string>
    ];
}
/** Returns the base fee. */
export function baseFeeInBp(options: BaseFeeInBpOptions) {
    const packageAddress = options.package ?? '@local-pkg/satoshi-flip';
    const argumentsTypes = [
        `${packageAddress}::house_data::HouseData`
    ] satisfies string[];
    const parameterNames = ["houseData"];
    return (tx: Transaction) => tx.moveCall({
        package: packageAddress,
        module: 'house_data',
        function: 'base_fee_in_bp',
        arguments: normalizeMoveArguments(options.arguments, argumentsTypes, parameterNames),
    });
}