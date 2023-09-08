// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

#[test_only]
module satoshi_flip::test_counter_nft {
    use sui::test_scenario;

    use satoshi_flip::counter_nft::{Self, Counter};

    // Test addresses.
    const USER: address = @0xCAFE;
    const NEW_USER: address = @0xDECAF;

    // Test errors.
    const EInvalidCountOnNewCounter: u64 = 1;
    const EInvalidCountOnIncreasedCounter: u64 = 2;

    #[test]
    fun creates_counter_nft() {
        let scenario_val = test_scenario::begin(USER);
        let scenario = &mut scenario_val;

        // Mint a counter NFT for USER.
        {
            let ctx = test_scenario::ctx(scenario);
            let counter = counter_nft::mint(ctx);
            counter_nft::transfer_to_sender(counter, ctx);
        };

        // Check that the initial count value is 0.
        test_scenario::next_tx(scenario, USER);
        {
            let counter_nft = test_scenario::take_from_sender<Counter>(scenario);
            assert!(counter_nft::count(&counter_nft) == 0, EInvalidCountOnNewCounter);
            test_scenario::return_to_sender(scenario, counter_nft);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun increments_counter_nft() {
        let scenario_val = test_scenario::begin(USER);
        let scenario = &mut scenario_val;

        // Mint a counter NFT for USER.
        {
            let ctx = test_scenario::ctx(scenario);
            let counter = counter_nft::mint(ctx);
            counter_nft::transfer_to_sender(counter, ctx);
        };

        // Increment it & check its value has increased.
        test_scenario::next_tx(scenario, USER);
        {
            let counter_nft = test_scenario::take_from_sender<Counter>(scenario);
            counter_nft::get_vrf_input_and_increment(&mut counter_nft);
            assert!(counter_nft::count(&counter_nft) == 1, EInvalidCountOnIncreasedCounter);
            test_scenario::return_to_sender(scenario, counter_nft);
        };

        test_scenario::end(scenario_val);
    }

    #[test]
    fun burns_counter_nft() {
        let scenario_val = test_scenario::begin(USER);
        let scenario = &mut scenario_val;

       // Mint a counter NFT for USER.
        {
            let ctx = test_scenario::ctx(scenario);
            let counter = counter_nft::mint(ctx);
            counter_nft::transfer_to_sender(counter, ctx);
        };

        // Burn the NFT.
        test_scenario::next_tx(scenario, USER);
        {
            let counter_nft = test_scenario::take_from_sender<Counter>(scenario);
            counter_nft::burn_for_testing(counter_nft);
        };

        test_scenario::end(scenario_val);
    }

}
