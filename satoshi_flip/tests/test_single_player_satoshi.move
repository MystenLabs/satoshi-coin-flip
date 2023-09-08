// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module satoshi_flip::test_single_player_satoshi {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_scenario::{Self};
    use sui::object::{Self};

    use satoshi_flip::test_common::{Self as tc};
    use satoshi_flip::single_player_satoshi::{Self as sps};
    use satoshi_flip::house_data::{Self as hd, HouseData};

    const EWrongPlayerBalanceAfterLoss: u64 = 6;
    const EWrongPlayerBalanceAfterWin: u64 = 5;
    const EWrongHouseFees: u64 = 3;
    const EWrongCoinBalance: u64 = 2;
    const EWrongHouseBalanceAfterWin: u64 = 1;
    const EWrongHouseBalanceAfterLoss: u64 = 0;

    // -------------- Constants ----------------
    const EPOCHS_TO_CHALLENGE: u64 = 7;

    // -------------- Sunny Day Tests ----------------
    #[test]
    fun house_wins() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        // Call init function, transfer HouseCap to the house.
        // House initializes the contract with PK.
        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game with a loosing guess.
        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), true, true);

        // House ends the game.
        tc::end_game(scenario, game_id, house, true);

        // Check that the outcome, player and house data balances are correct.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            // Ensure player has correct balance.
            assert!(coin::value(&player_coin) == tc::get_initial_player_balance() - tc::get_min_stake(), EWrongPlayerBalanceAfterLoss);
            // Ensure house has correct balance.
            assert!(hd::balance(&house_data) == tc::get_initial_house_balance() + tc::get_min_stake(), EWrongHouseBalanceAfterWin);
            test_scenario::return_to_sender(scenario, player_coin);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun player_wins() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game with a winning guess.
        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        let game_fee_in_bp = tc::game_fees(scenario, game_id, house);

        tc::end_game(scenario, game_id, house, true);

        // Check that player and house data balances are correct.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            let fees = sps::fee_amount(tc::get_min_stake()*2, game_fee_in_bp);
            // Ensure house balance and fees are correct.
            assert!(hd::balance(&house_data) == tc::get_initial_house_balance() - tc::get_min_stake(), EWrongHouseBalanceAfterLoss);
            assert!(hd::fees(&house_data) == fees, EWrongHouseFees);
            // Ensure player received a new coin with the correct balance.
            assert!(coin::value(&player_coin) == tc::get_min_stake()*2 - fees, EWrongPlayerBalanceAfterWin);
            test_scenario::return_to_sender(scenario, player_coin);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun player_cancels_game() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        // Simulate epoch passage.
        tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

        // Player cancels the game.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            sps::dispute_and_win(&mut house_data, game_id, ctx);
            test_scenario::return_shared(house_data);
        };

        // Check that the player received the total stake on dispute.
        // Also check that the game is on challenged state.
        test_scenario::next_tx(scenario, player);
        {
            let dispute_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
            assert!(coin::value(&dispute_coin) == tc::get_min_stake()*2, EWrongCoinBalance);
            test_scenario::return_to_sender(scenario, dispute_coin);
        };

        test_scenario::end(scenario_val);
    }

    // ------------- Rainy day tests -------------

    #[test]
    #[expected_failure(abort_code = sps::EInvalidBlsSig)]
    fun invalid_bls_sig() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        // House ends the game with an invalid BLS signature.
        tc::end_game(scenario, game_id, house, false);

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EInvalidGuess)]
    fun player_invalid_guess() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game with an invalid guess.
        tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, false);

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EStakeTooLow)]
    fun player_stake_too_low() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game with insufficient stake.
        tc::create_counter_nft_and_game(scenario, player, 100, false, true);

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EStakeTooHigh)]
    fun player_stake_too_high() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            // Funding the player with an amount higher than the maximum stake.
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_max_stake()*2);
        };

        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game with exceeding stake.
        tc::create_counter_nft_and_game(scenario, player, tc::get_max_stake() + tc::get_min_stake(), false, true);

        test_scenario::end(scenario_val);
    }


    #[test]
    #[expected_failure(abort_code = sps::EInsufficientHouseBalance)]
    fun house_insufficient_balance() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            // Funding the house with an amount lower than the minimum stake.
            tc::fund_addresses(scenario, house, player, 1, tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game.
        tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::ECanNotChallengeYet)]
    fun player_challenge_epochs_did_not_pass() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        // Player attempts to cancel the game before the required epochs have passed.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            sps::dispute_and_win(&mut house_data, game_id, ctx);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EGameDoesNotExist)]
    fun player_already_challenged_game() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            sps::dispute_and_win(&mut house_data, game_id, ctx);
            test_scenario::return_shared(house_data);
        };

        // Player tries to cancel game again.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            sps::dispute_and_win(&mut house_data, game_id, ctx);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EGameDoesNotExist)]
    fun player_already_finished_game_1() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

        tc::end_game(scenario, game_id, house, true);

        // Player tries to cancel game that has been challenged.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let ctx = test_scenario::ctx(scenario);
            sps::dispute_and_win(&mut house_data, game_id, ctx);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EGameDoesNotExist)]
    fun player_already_finished_game_2() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::create_counter_nft_and_game(scenario, player, tc::get_min_stake(), false, true);

        tc::end_game(scenario, game_id, house, true);

        // House ends the game again.
        tc::end_game(scenario, game_id, house, true);

        test_scenario::end(scenario_val);
    }
    
    #[test]
    #[expected_failure(abort_code = sps::EGameDoesNotExist)]
    fun game_does_not_exist_on_borrow() {
        let house = @0xCAFE;
        let player = @0xDECAF;
        let game_id = object::id_from_address(@0x1234);

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            // Funding the player with an amount higher than the maximum stake.
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        // Player tries to borrow a game that does not exist.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            sps::borrow_game(game_id, &house_data);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }
}