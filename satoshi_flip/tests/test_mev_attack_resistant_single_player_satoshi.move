// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module satoshi_flip::test_mev_attack_resistant_single_player_satoshi {
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use sui::test_scenario::{Self};
    use sui::object::{Self};

    use satoshi_flip::test_common::{Self as tc};
    use satoshi_flip::mev_attack_resistant_single_player_satoshi::{Self as sps};
    use satoshi_flip::house_data::{Self as hd, HouseData};

    const EWrongState: u64 = 7;
    const EWrongPlayerBalanceAfterLoss: u64 = 6;
    const EWrongPlayerBalanceAfterWin: u64 = 5;
    const EWrongWinner: u64 = 4;
    const EWrongHouseFees: u64 = 3;
    const EWrongCoinBalance: u64 = 2;
    const EWrongHouseBalanceAfterWin: u64 = 1;
    const EWrongHouseBalanceAfterLoss: u64 = 0;

    // -------------- Constants ----------------
    const FUNDS_SUBMITTED_STATE: u8 = 0;
    const GUESS_SUBMITTED_STATE: u8 = 1;
    const PLAYER_WON_STATE: u8 = 2;
    const HOUSE_WON_STATE: u8 = 3;
    const CHALLENGED_STATE: u8 = 4;

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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        // Check that the game is in funds sumbitted state.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let game = sps::borrow_game( &house_data, game_id);
            assert!(sps::status(game) == FUNDS_SUBMITTED_STATE, EWrongState);
            test_scenario::return_shared(house_data);
        };

        // Player creates a counter NFT and submits a loosing guess.
        tc::mev_submit_guess(scenario, game_id, player, true, true);


        // Check that the game is in guess submitted state.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let game = sps::borrow_game(&house_data, game_id);
            assert!(sps::status(game) == GUESS_SUBMITTED_STATE, EWrongState);
            test_scenario::return_shared(house_data);
        };

        // House ends the game.
        tc::mev_end_game(scenario, game_id, house, true);

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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        // Player creates a counter NFT and submits a winning guess.
        tc::mev_submit_guess(scenario, game_id, player, false, true);

        let game_fee_in_bp = tc::game_fees_mev(scenario, game_id, house);
        let fees = sps::fee_amount(tc::get_min_stake()*2, game_fee_in_bp);

        tc::mev_end_game(scenario, game_id, house, true);

        // Check that player and house data balances are correct.
        test_scenario::next_tx(scenario, player);
        {
            let house_data = test_scenario::take_shared<HouseData>(scenario);
            let player_coin = test_scenario::take_from_sender<Coin<SUI>>(scenario);
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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        tc::mev_submit_guess(scenario, game_id, player, false, true);

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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        tc::mev_submit_guess(scenario, game_id, player, true, true);

        // House ends the game with the wrong BLS signature.
        tc::mev_end_game(scenario, game_id, house, false);

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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        // Player submits an invalid guess.
        tc::mev_submit_guess(scenario, game_id, player, true, false);

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

        // Player creates his/her counter NFT and the game but with insufficient funds.
        tc::mev_create_game_counter_and_submit_stake(scenario, player, 100);

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
            // Fund player with a higher amount than the max stake.
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_max_stake()*2);
        };

        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game. Submitted stake exceeds limit.
        tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_max_stake() + tc::get_min_stake());

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
            // Fund house with insufficient balance.
            tc::fund_addresses(scenario, house, player, 1, tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        tc::mev_submit_guess(scenario, game_id, player, false, true);

        // Player attempts to cancel the game.
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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        tc::mev_submit_guess(scenario, game_id, player, false, true);

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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        tc::mev_submit_guess(scenario, game_id, player, false, true);

        tc::advance_epochs(scenario, house, EPOCHS_TO_CHALLENGE);

        tc::mev_end_game(scenario, game_id, house, true);

        // Player tries to cancel game after it has already ended.
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

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        tc::mev_submit_guess(scenario, game_id, player, false, true);

        tc::mev_end_game(scenario, game_id, house, true);

        // House ends the game after it has already been ended.
        tc::mev_end_game(scenario, game_id, house, true);

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EGameDoesNotExist)]
    fun player_game_does_not_exit() {
        let house = @0xCAFE;
        let player = @0xDECAF;
        let game_id = object::id_from_address(@0x404);

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        // Player tries to submit a guess for a game that does not exist.
        tc::mev_submit_guess(scenario, game_id, player, false, true);

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
            sps::borrow_game(&house_data, game_id);
            test_scenario::return_shared(house_data);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EGameInvalidState)]
    fun player_finish_game_invalid_state() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        // House tries to end game before player sumbits choice.
        tc::mev_end_game(scenario, game_id, house, true);

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::EGameInvalidState)]
    fun player_tries_to_dispute_game_with_no_guess() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        // Player tries to dispute game without submitting a guess first.
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
    #[expected_failure(abort_code = sps::EGameInvalidState)]
    fun player_tries_to_resubmit_guess() {
        let house = @0xCAFE;
        let player = @0xDECAF;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        let game_id = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        tc::mev_submit_guess(scenario, game_id, player, false, true);

        // Player tries to submit a different guess for the same game.
        tc::mev_submit_guess(scenario, game_id, player, true, true);

        test_scenario::end(scenario_val);
    }

    #[test]
    #[expected_failure(abort_code = sps::ECallerNotGamePlayer)]
    fun caller_not_player_on_submit_guess() {
        let house = @0xCAFE;
        let player = @0xDECAF;
        let another_player = @0xDAED;

        let scenario_val = test_scenario::begin(house);
        let scenario = &mut scenario_val;
        {
            tc::fund_addresses(scenario, house, player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
            tc::fund_addresses(scenario, house, another_player, tc::get_initial_house_balance(), tc::get_initial_player_balance());
        };

        tc::init_house(scenario, house, true);

        // Player creates his/her counter NFT and the game.
        let game_id_player = tc::mev_create_game_counter_and_submit_stake(scenario, player, tc::get_min_stake());

        // Another player creates his/her counter NFT and the game.
        tc::mev_create_game_counter_and_submit_stake(scenario, another_player, tc::get_min_stake());

        // Another player tries to submit a guess in a game that's not theirs.
        tc::mev_submit_guess_of_another_players_game(scenario, game_id_player, another_player, false, true);

        test_scenario::end(scenario_val);
    }

}
