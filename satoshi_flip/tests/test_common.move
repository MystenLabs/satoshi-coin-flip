#[test_only]
module satoshi_flip::test_common;

use satoshi_flip::house_data::{Self as hd, HouseCap, HouseData};
use satoshi_flip::mev_attack_resistant_single_player_satoshi as mev_sps;
use satoshi_flip::single_player_satoshi as sps;
use sui::coin::{Self, Coin};
use sui::random::{Self, Random};
use sui::sui::SUI;
use sui::test_scenario::{Self, Scenario};

// -------------- Constants ----------------

const MIN_STAKE: u64 = 1_000_000_000; // 1 SUI
const MAX_STAKE: u64 = 50_000_000_000; // 50 SUI
const INITIAL_HOUSE_BALANCE: u64 = 5_000_000_000; // 1 SUI
const INITIAL_PLAYER_BALANCE: u64 = 3_000_000_000; // 3 SUI

const HEADS: vector<u8> = b"H";
const TAILS: vector<u8> = b"T";
const INVALID: vector<u8> = b"X";

public fun get_min_stake(): u64 {
    MIN_STAKE
}

public fun get_max_stake(): u64 {
    MAX_STAKE
}

public fun get_initial_house_balance(): u64 {
    INITIAL_HOUSE_BALANCE
}

public fun get_initial_player_balance(): u64 {
    INITIAL_PLAYER_BALANCE
}

/// Used to initialize the user and house balances.
public fun fund_addresses(
    scenario: &mut Scenario,
    house: address,
    player: address,
    house_funds: u64,
    player_funds: u64,
) {
    let ctx = scenario.ctx();
    // Send coins to players.
    let coinA = coin::mint_for_testing<SUI>(house_funds, ctx);
    let coinB = coin::mint_for_testing<SUI>(player_funds, ctx);
    transfer::public_transfer(coinA, house);
    transfer::public_transfer(coinB, player);
}

/// Deployment & house object initialization.
/// Variable valid_coin is used to test expected failures.
public fun init_house(scenario: &mut Scenario, house: address, valid_coin: bool) {
    scenario.next_tx(@0x0);
    {
        let ctx = scenario.ctx();
        // Initialize the Random state for native randomness using the system account
        random::create_for_testing(ctx);
    };

    scenario.next_tx(house);
    {
        let ctx = scenario.ctx();
        hd::init_for_testing(ctx);
    };

    // House initializes the contract with PK.
    scenario.next_tx(house);
    {
        let house_cap = scenario.take_from_sender<HouseCap>();
        if (valid_coin) {
            let house_coin = scenario.take_from_sender<Coin<SUI>>();
            let ctx = scenario.ctx();
            house_cap.initialize_house_data(house_coin, ctx);
        } else {
            let ctx = scenario.ctx();
            let zero_coin = coin::zero<SUI>(ctx);
            house_cap.initialize_house_data(zero_coin, ctx);
        };
    };
}

/// Helper function to get the game's fees.
public fun game_fees(scenario: &mut Scenario, game_id: ID, house: address): u16 {
    scenario.next_tx(house);
    let house_data = scenario.take_shared<HouseData>();
    let game = sps::borrow_game(game_id, &house_data);
    let game_fee = game.fee_in_bp();
    test_scenario::return_shared(house_data);
    game_fee
}

/// Advance the scenario by n epochs.
public fun advance_epochs(scenario: &mut Scenario, sender: address, epochs: u64) {
    scenario.next_tx(sender);
    {
        let mut i = 0;
        while (i < epochs) {
            scenario.next_epoch(sender);
            i = i + 1;
        }
    };
}

// ------------------- For Single Player Satoshi -------------------

/// Used to create a game for the player.
/// Variables house_wins and valid_guess are used to test different outcomes and expected failures.
public fun create_counter_nft_and_game(
    scenario: &mut Scenario,
    player: address,
    stake: u64,
    house_wins: bool,
    valid_guess: bool,
): ID {
    scenario.next_tx(player);
    let mut player_coin = scenario.take_from_sender<Coin<SUI>>();
    let mut house_data = scenario.take_shared<HouseData>();
    let ctx = scenario.ctx();
    let stake_coin = player_coin.split(stake, ctx);
    let guess = if (house_wins) { HEADS.to_string() } else { TAILS.to_string() };
    let guess_value = if (valid_guess) { guess } else { INVALID.to_string() };
    let game_id = sps::start_game(guess_value, stake_coin, &mut house_data, ctx);
    test_scenario::return_shared(house_data);
    scenario.return_to_sender(player_coin);
    game_id
}

/// House ends the game using native randomness.
public fun end_game(scenario: &mut Scenario, game_id: ID, house: address, _valid_sig: bool) {
    scenario.next_tx(house);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let random_state = scenario.take_shared<Random>();
        let ctx = scenario.ctx();

        sps::finish_game(game_id, &mut house_data, &random_state, ctx);

        test_scenario::return_shared(house_data);
        test_scenario::return_shared(random_state);
    };
}

// ------------------- For MEV attack resistant Single Player Satoshi -------------------

/// Helper function to get the game's fees.
public fun game_fees_mev(scenario: &mut Scenario, game_id: ID, house: address): u16 {
    scenario.next_tx(house);
    let house_data = scenario.take_shared<HouseData>();
    let game = mev_sps::borrow_game(&house_data, game_id);
    let game_fee = game.fee_in_bp();
    test_scenario::return_shared(house_data);
    game_fee
}

/// Player creates the game and submits stake.
/// Stake is passed as a parameter to test various scenarios.
public fun mev_create_game_counter_and_submit_stake(
    scenario: &mut Scenario,
    player: address,
    stake: u64,
): ID {
    scenario.next_tx(player);
    let mut player_coin = scenario.take_from_sender<Coin<SUI>>();
    let mut house_data = scenario.take_shared<HouseData>();
    let ctx = scenario.ctx();
    let stake_coin = player_coin.split(stake, ctx);
    let game_id = mev_sps::create_game_and_submit_stake(&mut house_data, stake_coin, ctx);
    test_scenario::return_shared(house_data);
    scenario.return_to_sender(player_coin);

    game_id
}

/// Players submits guess.
public fun mev_submit_guess(
    scenario: &mut Scenario,
    game_id: ID,
    player: address,
    house_wins: bool,
    valid_guess: bool,
) {
    scenario.next_tx(player);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        let guess = if (house_wins) { HEADS.to_string() } else { TAILS.to_string() };
        let guess_value = if (valid_guess) { guess } else { INVALID.to_string() };
        mev_sps::submit_guess(&mut house_data, game_id, guess_value, ctx);
        test_scenario::return_shared(house_data);
    };
}

/// Players tries to submit guess on someone else's game.
public fun mev_submit_guess_of_another_players_game(
    scenario: &mut Scenario,
    game_id: ID,
    playerB: address,
    house_wins: bool,
    valid_guess: bool,
) {
    scenario.next_tx(playerB);
    {
        let guess = if (house_wins) { HEADS.to_string() } else { TAILS.to_string() };
        let guess_value = if (valid_guess) { guess } else { INVALID.to_string() };
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        mev_sps::submit_guess(&mut house_data, game_id, guess_value, ctx);
        test_scenario::return_shared(house_data);
    };
}

/// House ends the game using native randomness.
public fun mev_end_game(scenario: &mut Scenario, game_id: ID, house: address, _valid_sig: bool) {
    scenario.next_tx(house);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let random_state = scenario.take_shared<Random>();
        let ctx = scenario.ctx();

        mev_sps::finish_game(&mut house_data, game_id, &random_state, ctx);

        test_scenario::return_shared(house_data);
        test_scenario::return_shared(random_state);
    };
}
