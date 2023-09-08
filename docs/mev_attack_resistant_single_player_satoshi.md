
<a name="0x0_mev_attack_resistant_single_player_satoshi"></a>

# Module `0x0::mev_attack_resistant_single_player_satoshi`

This module implements a single player Satoshi Flip game that is resistant to MEV attacks.
Operates in a similar manner to single_player_satoshi_flip, but with the addition of
a guess submission step.


-  [Struct `NewGame`](#0x0_mev_attack_resistant_single_player_satoshi_NewGame)
-  [Struct `Outcome`](#0x0_mev_attack_resistant_single_player_satoshi_Outcome)
-  [Resource `Game`](#0x0_mev_attack_resistant_single_player_satoshi_Game)
-  [Constants](#@Constants_0)
-  [Function `create_game_and_submit_stake`](#0x0_mev_attack_resistant_single_player_satoshi_create_game_and_submit_stake)
-  [Function `submit_guess`](#0x0_mev_attack_resistant_single_player_satoshi_submit_guess)
-  [Function `finish_game`](#0x0_mev_attack_resistant_single_player_satoshi_finish_game)
-  [Function `dispute_and_win`](#0x0_mev_attack_resistant_single_player_satoshi_dispute_and_win)
-  [Function `guess_placed_epoch`](#0x0_mev_attack_resistant_single_player_satoshi_guess_placed_epoch)
-  [Function `stake`](#0x0_mev_attack_resistant_single_player_satoshi_stake)
-  [Function `guess`](#0x0_mev_attack_resistant_single_player_satoshi_guess)
-  [Function `player`](#0x0_mev_attack_resistant_single_player_satoshi_player)
-  [Function `vrf_input`](#0x0_mev_attack_resistant_single_player_satoshi_vrf_input)
-  [Function `fee_in_bp`](#0x0_mev_attack_resistant_single_player_satoshi_fee_in_bp)
-  [Function `status`](#0x0_mev_attack_resistant_single_player_satoshi_status)
-  [Function `fee_amount`](#0x0_mev_attack_resistant_single_player_satoshi_fee_amount)
-  [Function `game_exists`](#0x0_mev_attack_resistant_single_player_satoshi_game_exists)
-  [Function `borrow_game`](#0x0_mev_attack_resistant_single_player_satoshi_borrow_game)
-  [Function `borrow_mut`](#0x0_mev_attack_resistant_single_player_satoshi_borrow_mut)
-  [Function `map_guess`](#0x0_mev_attack_resistant_single_player_satoshi_map_guess)
-  [Function `internal_create_game_and_submit_stake`](#0x0_mev_attack_resistant_single_player_satoshi_internal_create_game_and_submit_stake)


<pre><code><b>use</b> <a href="counter_nft.md#0x0_counter_nft">0x0::counter_nft</a>;
<b>use</b> <a href="house_data.md#0x0_house_data">0x0::house_data</a>;
<b>use</b> <a href="">0x1::option</a>;
<b>use</b> <a href="">0x1::string</a>;
<b>use</b> <a href="">0x2::balance</a>;
<b>use</b> <a href="">0x2::bls12381</a>;
<b>use</b> <a href="">0x2::coin</a>;
<b>use</b> <a href="">0x2::dynamic_object_field</a>;
<b>use</b> <a href="">0x2::event</a>;
<b>use</b> <a href="">0x2::hash</a>;
<b>use</b> <a href="">0x2::object</a>;
<b>use</b> <a href="">0x2::sui</a>;
<b>use</b> <a href="">0x2::transfer</a>;
<b>use</b> <a href="">0x2::tx_context</a>;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_NewGame"></a>

## Struct `NewGame`

Emitted when a new game has its guess submitted.


<pre><code><b>struct</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_NewGame">NewGame</a> <b>has</b> <b>copy</b>, drop
</code></pre>



<details>
<summary>Fields</summary>


<dl>
<dt>
<code>game_id: <a href="_ID">object::ID</a></code>
</dt>
<dd>

</dd>
<dt>
<code>player: <b>address</b></code>
</dt>
<dd>

</dd>
<dt>
<code>vrf_input: <a href="">vector</a>&lt;u8&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>guess: <a href="_String">string::String</a></code>
</dt>
<dd>

</dd>
<dt>
<code>user_stake: u64</code>
</dt>
<dd>

</dd>
<dt>
<code>fee_bp: u16</code>
</dt>
<dd>

</dd>
</dl>


</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_Outcome"></a>

## Struct `Outcome`

Emitted when a game has ended.


<pre><code><b>struct</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Outcome">Outcome</a> <b>has</b> <b>copy</b>, drop
</code></pre>



<details>
<summary>Fields</summary>


<dl>
<dt>
<code>game_id: <a href="_ID">object::ID</a></code>
</dt>
<dd>

</dd>
<dt>
<code>status: u8</code>
</dt>
<dd>

</dd>
</dl>


</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_Game"></a>

## Resource `Game`

Represents a game and holds the acrued stake.
The guess field could have also been represented as a u8 or boolean, but we chose to use "H" and "T" strings for readability and safety.
Makes it easier for the user to assess if a selection they made on a DApp matches with the txn they are signing on their wallet.


<pre><code><b>struct</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a> <b>has</b> store, key
</code></pre>



<details>
<summary>Fields</summary>


<dl>
<dt>
<code>id: <a href="_UID">object::UID</a></code>
</dt>
<dd>

</dd>
<dt>
<code>guess_placed_epoch: <a href="_Option">option::Option</a>&lt;u64&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>total_stake: <a href="_Balance">balance::Balance</a>&lt;<a href="_SUI">sui::SUI</a>&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>guess: <a href="_Option">option::Option</a>&lt;<a href="_String">string::String</a>&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>player: <b>address</b></code>
</dt>
<dd>

</dd>
<dt>
<code>vrf_input: <a href="_Option">option::Option</a>&lt;<a href="">vector</a>&lt;u8&gt;&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>fee_bp: u16</code>
</dt>
<dd>

</dd>
<dt>
<code>status: u8</code>
</dt>
<dd>

</dd>
</dl>


</details>

<a name="@Constants_0"></a>

## Constants


<a name="0x0_mev_attack_resistant_single_player_satoshi_CHALLENGED_STATE"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_CHALLENGED_STATE">CHALLENGED_STATE</a>: u8 = 4;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_ECallerNotGamePlayer"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_ECallerNotGamePlayer">ECallerNotGamePlayer</a>: u64 = 7;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_ECanNotChallengeYet"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_ECanNotChallengeYet">ECanNotChallengeYet</a>: u64 = 3;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EGameDoesNotExist"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameDoesNotExist">EGameDoesNotExist</a>: u64 = 8;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EGameInvalidState"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameInvalidState">EGameInvalidState</a>: u64 = 6;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EGameNotInGuessSubmittedState"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameNotInGuessSubmittedState">EGameNotInGuessSubmittedState</a>: u64 = 9;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EInsufficientHouseBalance"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EInsufficientHouseBalance">EInsufficientHouseBalance</a>: u64 = 5;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EInvalidBlsSig"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EInvalidBlsSig">EInvalidBlsSig</a>: u64 = 2;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EInvalidGuess"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EInvalidGuess">EInvalidGuess</a>: u64 = 4;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EPOCHS_CANCEL_AFTER"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EPOCHS_CANCEL_AFTER">EPOCHS_CANCEL_AFTER</a>: u64 = 7;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EStakeTooHigh"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EStakeTooHigh">EStakeTooHigh</a>: u64 = 1;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_EStakeTooLow"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EStakeTooLow">EStakeTooLow</a>: u64 = 0;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_FUNDS_SUBMITTED_STATE"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_FUNDS_SUBMITTED_STATE">FUNDS_SUBMITTED_STATE</a>: u8 = 0;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_GAME_RETURN"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_GAME_RETURN">GAME_RETURN</a>: u8 = 2;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_GUESS_SUBMITTED_STATE"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_GUESS_SUBMITTED_STATE">GUESS_SUBMITTED_STATE</a>: u8 = 1;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_HEADS"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_HEADS">HEADS</a>: <a href="">vector</a>&lt;u8&gt; = [72];
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_HOUSE_WON_STATE"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_HOUSE_WON_STATE">HOUSE_WON_STATE</a>: u8 = 3;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_PLAYER_WON_STATE"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_PLAYER_WON_STATE">PLAYER_WON_STATE</a>: u8 = 2;
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_TAILS"></a>



<pre><code><b>const</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_TAILS">TAILS</a>: <a href="">vector</a>&lt;u8&gt; = [84];
</code></pre>



<a name="0x0_mev_attack_resistant_single_player_satoshi_create_game_and_submit_stake"></a>

## Function `create_game_and_submit_stake`

Function used to create a new game.
Stake is taken from the player's coin and added to the game's stake.
The house's stake is also added to the game's stake.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_create_game_and_submit_stake">create_game_and_submit_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, <a href="">coin</a>: <a href="_Coin">coin::Coin</a>&lt;<a href="_SUI">sui::SUI</a>&gt;, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>): <a href="_ID">object::ID</a>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_create_game_and_submit_stake">create_game_and_submit_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> HouseData, <a href="">coin</a>: Coin&lt;SUI&gt;, ctx: &<b>mut</b> TxContext): ID {
    <b>let</b> fee_bp = hd::base_fee_in_bp(<a href="house_data.md#0x0_house_data">house_data</a>);
    <b>let</b> (id, new_game) = <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_internal_create_game_and_submit_stake">internal_create_game_and_submit_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>, <a href="">coin</a>, fee_bp, ctx);

    dof::add(hd::borrow_mut(<a href="house_data.md#0x0_house_data">house_data</a>), id, new_game);
    id
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_submit_guess"></a>

## Function `submit_guess`

Function used to submit the VRF input & the player's guess.
Requires that the player has already submitted the stake and that they have already created at least one counter NFT.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_submit_guess">submit_guess</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, counter: &<b>mut</b> <a href="counter_nft.md#0x0_counter_nft_Counter">counter_nft::Counter</a>, game_id: <a href="_ID">object::ID</a>, guess: <a href="_String">string::String</a>, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_submit_guess">submit_guess</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> HouseData, counter: &<b>mut</b> Counter, game_id: ID, guess: String, ctx: &<b>mut</b> TxContext) {
    // Ensure that the game <b>exists</b>.
    <b>assert</b>!(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_game_exists">game_exists</a>(<a href="house_data.md#0x0_house_data">house_data</a>, game_id), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameDoesNotExist">EGameDoesNotExist</a>);

    // Ensure guess is valid.
    <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_map_guess">map_guess</a>(guess);

    // Get a mutable reference <b>to</b> the game <a href="">object</a>.
    <b>let</b> game_mut_ref = <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_borrow_mut">borrow_mut</a>( <a href="house_data.md#0x0_house_data">house_data</a>, game_id);

    // Ensure caller is the one that created the game.
    <b>assert</b>!(<a href="_sender">tx_context::sender</a>(ctx) == game_mut_ref.player, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_ECallerNotGamePlayer">ECallerNotGamePlayer</a>);
    // Ensure that the game is in a valid state.
    // For this function the game must be in <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_FUNDS_SUBMITTED_STATE">FUNDS_SUBMITTED_STATE</a>.
    // Other states are invalid <b>while</b> calling this function.
    <b>assert</b>!(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_status">status</a>(game_mut_ref) == <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_FUNDS_SUBMITTED_STATE">FUNDS_SUBMITTED_STATE</a>, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameInvalidState">EGameInvalidState</a>);

    // Update all the <a href="">option</a> fields
    <a href="_fill">option::fill</a>(&<b>mut</b> game_mut_ref.guess, guess);

    <b>let</b> vrf_input = <a href="counter_nft.md#0x0_counter_nft_get_vrf_input_and_increment">counter_nft::get_vrf_input_and_increment</a>(counter);
    <a href="_fill">option::fill</a>(&<b>mut</b> game_mut_ref.vrf_input, vrf_input);

    <b>let</b> guess_placed_epoch = <a href="_epoch">tx_context::epoch</a>(ctx);
    <a href="_fill">option::fill</a>(&<b>mut</b> game_mut_ref.guess_placed_epoch, guess_placed_epoch);

    // Update game status
    game_mut_ref.status = <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_GUESS_SUBMITTED_STATE">GUESS_SUBMITTED_STATE</a>;

    emit(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_NewGame">NewGame</a> {
        game_id,
        player: <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_player">player</a>(game_mut_ref),
        vrf_input,
        guess,
        user_stake: <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_stake">stake</a>(game_mut_ref) / (<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_GAME_RETURN">GAME_RETURN</a> <b>as</b> u64),
        fee_bp: <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_fee_in_bp">fee_in_bp</a>(game_mut_ref)
    });
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_finish_game"></a>

## Function `finish_game`

Function that determines the winner and distributes the funds accordingly.
If the player wins and fees are = 0, the entire stake balance is transferred to the player.
If the player wins and fees are > 0, the fees are taken from the stake balance and transferred
to the house before transferring the rewards to the player.
If house wins, the entire stake balance is transferred to the house_data's balance field.
Anyone can end the game (game & house_data objects are shared).
The BLS signature of the counter id and the counter's count at the time of game creation appended together.
If an incorrect BLS sig is passed the function will abort.
An Outcome event is emitted to signal that the game has ended.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_finish_game">finish_game</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, game_id: <a href="_ID">object::ID</a>, bls_sig: <a href="">vector</a>&lt;u8&gt;, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_finish_game">finish_game</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> HouseData, game_id: ID, bls_sig: <a href="">vector</a>&lt;u8&gt;, ctx: &<b>mut</b> TxContext) {
    // Ensure that the game <b>exists</b>.
    <b>assert</b>!(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_game_exists">game_exists</a>(<a href="house_data.md#0x0_house_data">house_data</a>, game_id), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameDoesNotExist">EGameDoesNotExist</a>);

    <b>let</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a> {
        id,
        guess_placed_epoch: _,
        total_stake,
        guess,
        player,
        vrf_input,
        fee_bp,
        status
    } = dof::remove(hd::borrow_mut(<a href="house_data.md#0x0_house_data">house_data</a>), game_id);

    <a href="_delete">object::delete</a>(id);

    // Ensure that the game is in the correct state
    <b>assert</b>!(status == <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_GUESS_SUBMITTED_STATE">GUESS_SUBMITTED_STATE</a>, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameInvalidState">EGameInvalidState</a>);

    // Step 1: Check the BLS signature, <b>if</b> its invalid <b>abort</b>.
    <b>let</b> is_sig_valid = bls12381_min_pk_verify(&bls_sig, &hd::public_key(<a href="house_data.md#0x0_house_data">house_data</a>), <a href="_borrow">option::borrow</a>(&vrf_input));
    <b>assert</b>!(is_sig_valid, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EInvalidBlsSig">EInvalidBlsSig</a>);

    // Hash the beacon before taking the 1st byte.
    <b>let</b> hashed_beacon = blake2b256(&bls_sig);
    // Step 2: Determine winner.
    <b>let</b> first_byte = *<a href="_borrow">vector::borrow</a>(&hashed_beacon, 0);
    <b>let</b> game_guess = *<a href="_borrow">option::borrow</a>(&guess);
    <b>let</b> player_won = <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_map_guess">map_guess</a>(game_guess) == (first_byte % 2);
    <b>let</b> stake_amount = <a href="_value">balance::value</a>(&total_stake);

    // Step 3: Distribute funds based on result.
    <b>let</b> status = <b>if</b> (player_won) {
        // Step 3.a: If player wins <a href="">transfer</a> the game <a href="">balance</a> <b>as</b> a <a href="">coin</a> <b>to</b> the player.
        // Calculate the fee and <a href="">transfer</a> it <b>to</b> the house.
        <b>let</b> amount = <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_fee_amount">fee_amount</a>(stake_amount, fee_bp);
        <b>let</b> fees = <a href="_split">balance::split</a>(&<b>mut</b> total_stake, amount);
        <a href="_join">balance::join</a>(hd::borrow_fees_mut(<a href="house_data.md#0x0_house_data">house_data</a>), fees);

        // Calculate the rewards and take it from the game stake.
        <a href="_public_transfer">transfer::public_transfer</a>(<a href="_from_balance">coin::from_balance</a>(total_stake, ctx), player);
        <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_PLAYER_WON_STATE">PLAYER_WON_STATE</a>
    } <b>else</b> {
        // Step 3.b: If house wins, then add the game stake <b>to</b> the <a href="house_data.md#0x0_house_data">house_data</a>.house_balance (no fees are taken).
        <a href="_join">balance::join</a>(hd::borrow_balance_mut(<a href="house_data.md#0x0_house_data">house_data</a>), total_stake);
        <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_HOUSE_WON_STATE">HOUSE_WON_STATE</a>
    };

    emit(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Outcome">Outcome</a> {
        game_id,
        status
    });
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_dispute_and_win"></a>

## Function `dispute_and_win`

Function used to cancel a game after EPOCHS_CANCEL_AFTER epochs have passed. Can be called by anyone.
On successful execution the entire game stake is returned to the player.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_dispute_and_win">dispute_and_win</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, game_id: <a href="_ID">object::ID</a>, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_dispute_and_win">dispute_and_win</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> HouseData, game_id: ID, ctx: &<b>mut</b> TxContext) {
    // Ensure that the game <b>exists</b>.
    <b>assert</b>!(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_game_exists">game_exists</a>(<a href="house_data.md#0x0_house_data">house_data</a>, game_id), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameDoesNotExist">EGameDoesNotExist</a>);

    <b>let</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a> {
        id,
        guess_placed_epoch,
        total_stake,
        guess: _,
        player,
        vrf_input: _,
        fee_bp: _,
        status
    } = dof::remove(hd::borrow_mut(<a href="house_data.md#0x0_house_data">house_data</a>), game_id);

    <a href="_delete">object::delete</a>(id);

    // Ensure that the game is in the correct state
    <b>assert</b>!(status == <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_GUESS_SUBMITTED_STATE">GUESS_SUBMITTED_STATE</a>, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameInvalidState">EGameInvalidState</a>);

    <b>let</b> current_epoch = <a href="_epoch">tx_context::epoch</a>(ctx);
    <b>let</b> cancel_epoch = *<a href="_borrow">option::borrow</a>(&guess_placed_epoch) + <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EPOCHS_CANCEL_AFTER">EPOCHS_CANCEL_AFTER</a>;

    // Ensure that minimum epochs have passed before user can cancel.
    <b>assert</b>!(cancel_epoch &lt;= current_epoch, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_ECanNotChallengeYet">ECanNotChallengeYet</a>);

    <a href="_public_transfer">transfer::public_transfer</a>(<a href="_from_balance">coin::from_balance</a>(total_stake, ctx), player);

    emit(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Outcome">Outcome</a> {
        game_id,
        status: <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_CHALLENGED_STATE">CHALLENGED_STATE</a>
    });
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_guess_placed_epoch"></a>

## Function `guess_placed_epoch`

Returns the epoch in which the guess was placed.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_guess_placed_epoch">guess_placed_epoch</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_guess_placed_epoch">guess_placed_epoch</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>): u64 {
    <b>assert</b>!(<a href="_is_some">option::is_some</a>(&game.guess_placed_epoch), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameNotInGuessSubmittedState">EGameNotInGuessSubmittedState</a>);
    *<a href="_borrow">option::borrow</a>(&game.guess_placed_epoch)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_stake"></a>

## Function `stake`

Returns the total stake.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_stake">stake</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_stake">stake</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>): u64 {
    <a href="_value">balance::value</a>(&game.total_stake)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_guess"></a>

## Function `guess`

Returns the player's guess.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_guess">guess</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>): u8
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_guess">guess</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>): u8 {
    <b>assert</b>!(<a href="_is_some">option::is_some</a>(&game.guess), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameNotInGuessSubmittedState">EGameNotInGuessSubmittedState</a>);
    <b>let</b> guess = *<a href="_borrow">option::borrow</a>(&game.guess);
    <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_map_guess">map_guess</a>(guess)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_player"></a>

## Function `player`

Returns the player's address.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_player">player</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>): <b>address</b>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_player">player</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>): <b>address</b> {
    game.player
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_vrf_input"></a>

## Function `vrf_input`

Returns the player's vrf_input bytes.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_vrf_input">vrf_input</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>): <a href="">vector</a>&lt;u8&gt;
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_vrf_input">vrf_input</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>): <a href="">vector</a>&lt;u8&gt; {
    <b>assert</b>!(<a href="_is_some">option::is_some</a>(&game.vrf_input), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameNotInGuessSubmittedState">EGameNotInGuessSubmittedState</a>);
    *<a href="_borrow">option::borrow</a>(&game.vrf_input)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_fee_in_bp"></a>

## Function `fee_in_bp`

Returns the fee of the game.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_fee_in_bp">fee_in_bp</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>): u16
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_fee_in_bp">fee_in_bp</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>): u16 {
    game.fee_bp
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_status"></a>

## Function `status`

Returns the status of the game.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_status">status</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>): u8
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_status">status</a>(game: &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>): u8 {
    game.status
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_fee_amount"></a>

## Function `fee_amount`

Helper function to calculate the amount of fees to be paid.
Fees are only applied on the player's stake.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_fee_amount">fee_amount</a>(game_stake: u64, fee_in_bp: u16): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_fee_amount">fee_amount</a>(game_stake: u64, fee_in_bp: u16): u64 {
    ((((game_stake / (<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_GAME_RETURN">GAME_RETURN</a> <b>as</b> u64)) <b>as</b> u128) * (fee_in_bp <b>as</b> u128) / 10_000) <b>as</b> u64)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_game_exists"></a>

## Function `game_exists`

Helper function to check if a game exists.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_game_exists">game_exists</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, game_id: <a href="_ID">object::ID</a>): bool
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_game_exists">game_exists</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &HouseData, game_id: ID): bool {
    dof::exists_(hd::borrow(<a href="house_data.md#0x0_house_data">house_data</a>), game_id)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_borrow_game"></a>

## Function `borrow_game`

Helper function to check that a game exists and return a reference to the game Object.


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_borrow_game">borrow_game</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, game_id: <a href="_ID">object::ID</a>): &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_borrow_game">borrow_game</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &HouseData, game_id: ID): &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a> {
    <b>assert</b>!(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_game_exists">game_exists</a>(<a href="house_data.md#0x0_house_data">house_data</a>, game_id), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameDoesNotExist">EGameDoesNotExist</a>);
    dof::borrow(hd::borrow(<a href="house_data.md#0x0_house_data">house_data</a>), game_id)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_borrow_mut"></a>

## Function `borrow_mut`

Helper function to check that a game exists and return a mutable reference to the game Object.


<pre><code><b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_borrow_mut">borrow_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, game_id: <a href="_ID">object::ID</a>): &<b>mut</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_borrow_mut">borrow_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> HouseData, game_id: ID): &<b>mut</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a> {
    <b>assert</b>!(<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_game_exists">game_exists</a>(<a href="house_data.md#0x0_house_data">house_data</a>, game_id), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EGameDoesNotExist">EGameDoesNotExist</a>);
    dof::borrow_mut(hd::borrow_mut(<a href="house_data.md#0x0_house_data">house_data</a>), game_id)
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_map_guess"></a>

## Function `map_guess`

Helper function to map (H)EADS and (T)AILS to 0 and 1 respectively.
H = 0
T = 1


<pre><code><b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_map_guess">map_guess</a>(guess: <a href="_String">string::String</a>): u8
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_map_guess">map_guess</a>(guess: String): u8 {
    <b>assert</b>!(<a href="_bytes">string::bytes</a>(&guess) == &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_HEADS">HEADS</a> || <a href="_bytes">string::bytes</a>(&guess) == &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_TAILS">TAILS</a>, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EInvalidGuess">EInvalidGuess</a>);

    <b>if</b> (<a href="_bytes">string::bytes</a>(&guess) == &<a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_HEADS">HEADS</a>) {
        0
    } <b>else</b> {
        1
    }
}
</code></pre>



</details>

<a name="0x0_mev_attack_resistant_single_player_satoshi_internal_create_game_and_submit_stake"></a>

## Function `internal_create_game_and_submit_stake`

Internal helper function used to create a new game.
Stake is taken from the player's coin and added to the game's stake.
The house's stake is also added to the game's stake.


<pre><code><b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_internal_create_game_and_submit_stake">internal_create_game_and_submit_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, <a href="">coin</a>: <a href="_Coin">coin::Coin</a>&lt;<a href="_SUI">sui::SUI</a>&gt;, fee_bp: u16, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>): (<a href="_ID">object::ID</a>, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">mev_attack_resistant_single_player_satoshi::Game</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>fun</b> <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_internal_create_game_and_submit_stake">internal_create_game_and_submit_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> HouseData, <a href="">coin</a>: Coin&lt;SUI&gt;, fee_bp: u16, ctx: &<b>mut</b> TxContext): (ID, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a>) {
    <b>let</b> user_stake = <a href="_value">coin::value</a>(&<a href="">coin</a>);
    // Ensure that the stake is not higher than the max stake.
    <b>assert</b>!(user_stake &lt;= hd::max_stake(<a href="house_data.md#0x0_house_data">house_data</a>), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EStakeTooHigh">EStakeTooHigh</a>);
    // Ensure that the stake is not lower than the <b>min</b> stake.
    <b>assert</b>!(user_stake &gt;= hd::min_stake(<a href="house_data.md#0x0_house_data">house_data</a>), <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EStakeTooLow">EStakeTooLow</a>);
    // Ensure that the house <b>has</b> enough <a href="">balance</a> <b>to</b> play for this game.
    <b>assert</b>!(hd::balance(<a href="house_data.md#0x0_house_data">house_data</a>) &gt;= user_stake, <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_EInsufficientHouseBalance">EInsufficientHouseBalance</a>);


    // Get the house's stake.
    <b>let</b> total_stake = <a href="_split">balance::split</a>(hd::borrow_balance_mut(<a href="house_data.md#0x0_house_data">house_data</a>), user_stake);
    <a href="_put">coin::put</a>(&<b>mut</b> total_stake, <a href="">coin</a>);

    <b>let</b> id = <a href="_new">object::new</a>(ctx);
    <b>let</b> new_game = <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_Game">Game</a> {
        id,
        guess_placed_epoch: <a href="_none">option::none</a>(),
        total_stake,
        guess: <a href="_none">option::none</a>(),
        player: <a href="_sender">tx_context::sender</a>(ctx),
        vrf_input: <a href="_none">option::none</a>(),
        fee_bp,
        status: <a href="mev_attack_resistant_single_player_satoshi.md#0x0_mev_attack_resistant_single_player_satoshi_FUNDS_SUBMITTED_STATE">FUNDS_SUBMITTED_STATE</a>
    };

    (<a href="_id">object::id</a>(&new_game), new_game)
}
</code></pre>



</details>
