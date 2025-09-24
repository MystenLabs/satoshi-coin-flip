// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module satoshi_flip::test_single_player_satoshi;

use satoshi_flip::house_data::HouseData;
use satoshi_flip::single_player_satoshi as sps;
use satoshi_flip::test_common as tc;
use sui::coin::Coin;
use sui::sui::SUI;
use sui::test_scenario;

const EWrongPlayerBalanceAfterLoss: u64 = 6;
const EWrongCoinBalance: u64 = 2;
const EWrongHouseBalanceAfterWin: u64 = 1;

// -------------- Constants ----------------
const EPOCHS_TO_CHALLENGE: u64 = 7;

// -------------- Sunny Day Tests ----------------
#[test]
fun game_completes_successfully() {
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

    // Player creates game.
    let game_id = tc::create_counter_nft_and_game(
        scenario,
        player,
        tc::get_min_stake(),
        false,
        true,
    );

    // House ends the game.
    tc::end_game(scenario, game_id, house, true);

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

        // Total funds should be conserved (house balance + house fees + player balance + player stake should equal initial total)
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

    let game_id = tc::create_counter_nft_and_game(
        scenario,
        player,
        tc::get_min_stake(),
        false,
        true,
    );

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
    // Also check that the game is on challenged state.
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

    // Player creates his/her counter NFT and the game with an invalid guess.
    tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, false);

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

    // Player creates his/her counter NFT and the game with insufficient stake.
    tc::create_counter_nft_and_game(scenario, player, 100, false, true);

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
        // Funding the player with an amount higher than the maximum stake.
        tc::fund_addresses(
            scenario,
            house,
            player,
            tc::get_initial_house_balance(),
            tc::get_max_stake()*2,
        );
    };

    tc::init_house(scenario, house, true);

    // Player creates his/her counter NFT and the game with exceeding stake.
    tc::create_counter_nft_and_game(
        scenario,
        player,
        tc::get_max_stake() + tc::get_min_stake(),
        false,
        true,
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
        // Funding the house with an amount lower than the minimum stake.
        tc::fund_addresses(scenario, house, player, 1, tc::get_initial_player_balance());
    };

    tc::init_house(scenario, house, true);

    // Player creates his/her counter NFT and the game.
    tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

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

    let game_id = tc::create_counter_nft_and_game(
        scenario,
        player,
        tc::get_min_stake(),
        false,
        true,
    );

    // Player attempts to cancel the game before the required epochs have passed.
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

    let game_id = tc::create_counter_nft_and_game(
        scenario,
        player,
        tc::get_min_stake(),
        false,
        true,
    );

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

    let game_id = tc::create_counter_nft_and_game(
        scenario,
        player,
        tc::get_min_stake(),
        false,
        true,
    );

    tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

    tc::end_game(scenario, game_id, house, true);

    // Player tries to cancel game that has been challenged.
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

    let game_id = tc::create_counter_nft_and_game(
        scenario,
        player,
        tc::get_min_stake(),
        false,
        true,
    );

    tc::end_game(scenario, game_id, house, true);

    // House ends the game again.
    tc::end_game(scenario, game_id, house, true);

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
        sps::borrow_game(game_id, &house_data);
        test_scenario::return_shared(house_data);
    };

    scenario_val.end();
}
