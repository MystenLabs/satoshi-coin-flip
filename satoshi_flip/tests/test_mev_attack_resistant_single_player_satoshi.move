// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module satoshi_flip::test_mev_attack_resistant_single_player_satoshi;

use satoshi_flip::house_data::HouseData;
use satoshi_flip::mev_attack_resistant_single_player_satoshi as sps;
use satoshi_flip::test_common as tc;
use sui::coin::Coin;
use sui::sui::SUI;
use sui::test_scenario;

const EWrongState: u64 = 7;
const EWrongPlayerBalanceAfterLoss: u64 = 6;
const EWrongCoinBalance: u64 = 2;
const EWrongHouseBalanceAfterWin: u64 = 1;

// -------------- Constants ----------------
const FUNDS_SUBMITTED_STATE: u8 = 0;
const GUESS_SUBMITTED_STATE: u8 = 1;

const EPOCHS_TO_CHALLENGE: u64 = 7;

// -------------- Sunny Day Tests ----------------
#[test]
fun mev_game_completes_successfully() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    // Call init function, transfer HouseCap to the house.
    // House initializes the contract with PK.
    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    // Check that the game is in funds submitted state.
    scenario.next_tx(player);
    {
        let house_data = scenario.take_shared<HouseData>();
        let game = sps::borrow_game(&house_data, game_id);
        assert!(game.status() == FUNDS_SUBMITTED_STATE, EWrongState);
        test_scenario::return_shared(house_data);
    };

    // Player submits guess.
    tc::mev_submit_guess(scenario, game_id, player, false, true);

    // Check that the game is in guess submitted state.
    scenario.next_tx(player);
    {
        let house_data = scenario.take_shared<HouseData>();
        let game = sps::borrow_game(&house_data, game_id);
        assert!(game.status() == GUESS_SUBMITTED_STATE, EWrongState);
        test_scenario::return_shared(house_data);
    };

    // House ends the game.
    tc::mev_end_game(scenario, game_id, house, true);

    // Check that the game completed successfully and balances are consistent.
    scenario.next_tx(player);
    {
        let house_data = scenario.take_shared<HouseData>();
        let player_coin = scenario.take_from_sender<Coin<SUI>>();

        // Player should have spent exactly the stake amount
        assert!(
            player_coin.value() <= tc::get_initial_player_balance() - tc::get_min_stake(),
            EWrongPlayerBalanceAfterLoss,
        );

        // Total funds should be conserved
        let total_after = house_data.balance() + house_data.fees() + player_coin.value();
        let total_before = tc::get_initial_house_balance() + tc::get_initial_player_balance();
        assert!(total_after == total_before, EWrongHouseBalanceAfterWin);

        scenario.return_to_sender(player_coin);
        test_scenario::return_shared(house_data);
    };

    scenario_val.end();
}

#[test]
fun player_cancels_game() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    tc::mev_submit_guess(scenario, game_id, player, false, true);

    // Simulate epoch passage.
    tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

    // Player cancels the game.
    scenario.next_tx(player);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        sps::dispute_and_win(&mut house_data, game_id, ctx);
        test_scenario::return_shared(house_data);
    };

    // Check that the player received the total stake on dispute.
    scenario.next_tx(player);
    {
        let dispute_coin = scenario.take_from_sender<Coin<SUI>>();
        assert!(dispute_coin.value() == tc::get_min_stake()*2, EWrongCoinBalance);
        scenario.return_to_sender(dispute_coin);
    };

    scenario_val.end();
}

// ------------- Rainy day tests -------------

#[test]
#[expected_failure(abort_code = sps::EInvalidGuess)]
fun player_invalid_guess() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    // Player submits an invalid guess.
    tc::mev_submit_guess(scenario, game_id, player, true, false);

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EStakeTooLow)]
fun player_stake_too_low() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    // Player creates his/her counter NFT and the game but with insufficient funds.
    tc::mev_create_game_counter_and_submit_stake(scenario, player, 100);

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EStakeTooHigh)]
fun player_stake_too_high() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        // Fund player with a higher amount than the max stake.
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_max_stake()*2,
        );
    };

    tc::init_house(scenario, house, true);

    // Player creates his/her counter NFT and the game. Submitted stake exceeds limit.
    tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_max_stake() + tc::get_min_stake(),
    );

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EInsufficientHouseBalance)]
fun house_insufficient_balance() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        // Fund house with insufficient balance.
        tc::fund_addresses(scenario, house, player, 1, tc::get_initial_player_balance());
    };

    tc::init_house(scenario, house, true);

    tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::ECanNotChallengeYet)]
fun player_challenge_epochs_did_not_pass() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    tc::mev_submit_guess(scenario, game_id, player, false, true);

    // Player attempts to cancel the game.
    scenario.next_tx(player);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        sps::dispute_and_win(&mut house_data, game_id, ctx);
        test_scenario::return_shared(house_data);
    };

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameDoesNotExist)]
fun player_already_challenged_game() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    tc::mev_submit_guess(scenario, game_id, player, false, true);

    tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

    scenario.next_tx(player);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        sps::dispute_and_win(&mut house_data, game_id, ctx);
        test_scenario::return_shared(house_data);
    };

    // Player tries to cancel game again.
    scenario.next_tx(player);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        sps::dispute_and_win(&mut house_data, game_id, ctx);
        test_scenario::return_shared(house_data);
    };

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameDoesNotExist)]
fun player_already_finished_game_1() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    tc::mev_submit_guess(scenario, game_id, player, false, true);

    tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

    tc::mev_end_game(scenario, game_id, house, true);

    // Player tries to cancel game after it has already ended.
    scenario.next_tx(player);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        sps::dispute_and_win(&mut house_data, game_id, ctx);
        test_scenario::return_shared(house_data);
    };

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameDoesNotExist)]
fun player_already_finished_game_2() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    tc::mev_submit_guess(scenario, game_id, player, false, true);

    tc::mev_end_game(scenario, game_id, house, true);

    // House ends the game after it has already been ended.
    tc::mev_end_game(scenario, game_id, house, true);

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameDoesNotExist)]
fun player_game_does_not_exit() {
    let house = @0xCAFE;
    let player = @0xDECAF;
    let game_id = object::id_from_address(@0x404);

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

    // Player tries to submit a guess for a game that does not exist.
    tc::mev_submit_guess(scenario, game_id, player, false, true);

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameDoesNotExist)]
fun game_does_not_exist_on_borrow() {
    let house = @0xCAFE;
    let player = @0xDECAF;
    let game_id = object::id_from_address(@0x1234);

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        // Funding the player with an amount higher than the maximum stake.
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    // Player tries to borrow a game that does not exist.
    scenario.next_tx(player);
    {
        let house_data = scenario.take_shared<HouseData>();
        sps::borrow_game(&house_data, game_id);
        test_scenario::return_shared(house_data);
    };

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameInvalidState)]
fun player_finish_game_invalid_state() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    // House tries to end game before player sumbits choice.
    tc::mev_end_game(scenario, game_id, house, true);

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameInvalidState)]
fun player_tries_to_dispute_game_with_no_guess() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    // Player tries to dispute game without submitting a guess first.
    scenario.next_tx(player);
    {
        let mut house_data = scenario.take_shared<HouseData>();
        let ctx = scenario.ctx();
        sps::dispute_and_win(&mut house_data, game_id, ctx);
        test_scenario::return_shared(house_data);
    };

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::EGameInvalidState)]
fun player_tries_to_resubmit_guess() {
    let house = @0xCAFE;
    let player = @0xDECAF;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    let game_id = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    tc::mev_submit_guess(scenario, game_id, player, false, true);

    // Player tries to submit a different guess for the same game.
    tc::mev_submit_guess(scenario, game_id, player, true, true);

    scenario_val.end();
}

#[test]
#[expected_failure(abort_code = sps::ECallerNotGamePlayer)]
fun caller_not_player_on_submit_guess() {
    let house = @0xCAFE;
    let player = @0xDECAF;
    let another_player = @0xDAED;

    let mut scenario_val = test_scenario::begin(house);
    let scenario = &mut scenario_val;
    {
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
        tc::fund_addresses(
            scenario,
            house,
            another_player,
            tc::get_initial_house_balance(),
            tc::get_initial_player_balance(),
        );
    };

    tc::init_house(scenario, house, true);

    // Player creates his/her counter NFT and the game.
    let game_id_player = tc::mev_create_game_counter_and_submit_stake(
        scenario,
        player,
        tc::get_min_stake(),
    );

    // Another player creates his/her counter NFT and the game.
    tc::mev_create_game_counter_and_submit_stake(scenario, another_player, tc::get_min_stake());

    // Another player tries to submit a guess in a game that's not theirs.
    tc::mev_submit_guess_of_another_players_game(
        scenario,
        game_id_player,
        another_player,
        false,
        true,
    );

    scenario_val.end();
}
