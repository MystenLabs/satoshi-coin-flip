
<a name="0x0_house_data"></a>

# Module `0x0::house_data`

An abstraction used to represent the house in a game of Satoshi Coin Flip.
The house is the entity that defines game restrictions and fees.
All games reside below the house as DoFs.


-  [Resource `HouseData`](#0x0_house_data_HouseData)
-  [Resource `HouseCap`](#0x0_house_data_HouseCap)
-  [Struct `HOUSE_DATA`](#0x0_house_data_HOUSE_DATA)
-  [Constants](#@Constants_0)
-  [Function `init`](#0x0_house_data_init)
-  [Function `initialize_house_data`](#0x0_house_data_initialize_house_data)
-  [Function `top_up`](#0x0_house_data_top_up)
-  [Function `withdraw`](#0x0_house_data_withdraw)
-  [Function `claim_fees`](#0x0_house_data_claim_fees)
-  [Function `update_max_stake`](#0x0_house_data_update_max_stake)
-  [Function `update_min_stake`](#0x0_house_data_update_min_stake)
-  [Function `borrow_balance_mut`](#0x0_house_data_borrow_balance_mut)
-  [Function `borrow_fees_mut`](#0x0_house_data_borrow_fees_mut)
-  [Function `borrow_mut`](#0x0_house_data_borrow_mut)
-  [Function `borrow`](#0x0_house_data_borrow)
-  [Function `balance`](#0x0_house_data_balance)
-  [Function `house`](#0x0_house_data_house)
-  [Function `public_key`](#0x0_house_data_public_key)
-  [Function `max_stake`](#0x0_house_data_max_stake)
-  [Function `min_stake`](#0x0_house_data_min_stake)
-  [Function `fees`](#0x0_house_data_fees)
-  [Function `base_fee_in_bp`](#0x0_house_data_base_fee_in_bp)


<pre><code><b>use</b> <a href="">0x2::balance</a>;
<b>use</b> <a href="">0x2::coin</a>;
<b>use</b> <a href="">0x2::object</a>;
<b>use</b> <a href="">0x2::package</a>;
<b>use</b> <a href="">0x2::sui</a>;
<b>use</b> <a href="">0x2::transfer</a>;
<b>use</b> <a href="">0x2::tx_context</a>;
</code></pre>



<a name="0x0_house_data_HouseData"></a>

## Resource `HouseData`

Configuration and Treasury object, managed by the house.


<pre><code><b>struct</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a> <b>has</b> key
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
<code><a href="">balance</a>: <a href="_Balance">balance::Balance</a>&lt;<a href="_SUI">sui::SUI</a>&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>house: <b>address</b></code>
</dt>
<dd>

</dd>
<dt>
<code>public_key: <a href="">vector</a>&lt;u8&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>max_stake: u64</code>
</dt>
<dd>

</dd>
<dt>
<code>min_stake: u64</code>
</dt>
<dd>

</dd>
<dt>
<code>fees: <a href="_Balance">balance::Balance</a>&lt;<a href="_SUI">sui::SUI</a>&gt;</code>
</dt>
<dd>

</dd>
<dt>
<code>base_fee_in_bp: u16</code>
</dt>
<dd>

</dd>
</dl>


</details>

<a name="0x0_house_data_HouseCap"></a>

## Resource `HouseCap`

A one-time use capability to initialize the house data; created and sent
to sender in the initializer.


<pre><code><b>struct</b> <a href="house_data.md#0x0_house_data_HouseCap">HouseCap</a> <b>has</b> key
</code></pre>



<details>
<summary>Fields</summary>


<dl>
<dt>
<code>id: <a href="_UID">object::UID</a></code>
</dt>
<dd>

</dd>
</dl>


</details>

<a name="0x0_house_data_HOUSE_DATA"></a>

## Struct `HOUSE_DATA`

Used as a one time witness to generate the publisher.


<pre><code><b>struct</b> <a href="house_data.md#0x0_house_data_HOUSE_DATA">HOUSE_DATA</a> <b>has</b> drop
</code></pre>



<details>
<summary>Fields</summary>


<dl>
<dt>
<code>dummy_field: bool</code>
</dt>
<dd>

</dd>
</dl>


</details>

<a name="@Constants_0"></a>

## Constants


<a name="0x0_house_data_ECallerNotHouse"></a>



<pre><code><b>const</b> <a href="house_data.md#0x0_house_data_ECallerNotHouse">ECallerNotHouse</a>: u64 = 0;
</code></pre>



<a name="0x0_house_data_EInsufficientBalance"></a>



<pre><code><b>const</b> <a href="house_data.md#0x0_house_data_EInsufficientBalance">EInsufficientBalance</a>: u64 = 1;
</code></pre>



<a name="0x0_house_data_init"></a>

## Function `init`



<pre><code><b>fun</b> <a href="house_data.md#0x0_house_data_init">init</a>(otw: <a href="house_data.md#0x0_house_data_HOUSE_DATA">house_data::HOUSE_DATA</a>, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>fun</b> <a href="house_data.md#0x0_house_data_init">init</a>(otw: <a href="house_data.md#0x0_house_data_HOUSE_DATA">HOUSE_DATA</a>, ctx: &<b>mut</b> TxContext) {
    // Creating and sending the Publisher <a href="">object</a> <b>to</b> the sender.
    <a href="_claim_and_keep">package::claim_and_keep</a>(otw, ctx);

    // Creating and sending the <a href="house_data.md#0x0_house_data_HouseCap">HouseCap</a> <a href="">object</a> <b>to</b> the sender.
    <b>let</b> house_cap = <a href="house_data.md#0x0_house_data_HouseCap">HouseCap</a> {
        id: <a href="_new">object::new</a>(ctx)
    };

    <a href="_transfer">transfer::transfer</a>(house_cap, <a href="_sender">tx_context::sender</a>(ctx));
}
</code></pre>



</details>

<a name="0x0_house_data_initialize_house_data"></a>

## Function `initialize_house_data`

Initializer function that should only be called once and by the creator of the contract.
Initializes the house data object with the house's public key and an initial balance.
It also sets the max and min stake values, that can later on be updated.
Stores the house address and the base fee in basis points.
This object is involed in all games created by the same instance of this package.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_initialize_house_data">initialize_house_data</a>(house_cap: <a href="house_data.md#0x0_house_data_HouseCap">house_data::HouseCap</a>, <a href="">coin</a>: <a href="_Coin">coin::Coin</a>&lt;<a href="_SUI">sui::SUI</a>&gt;, public_key: <a href="">vector</a>&lt;u8&gt;, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_initialize_house_data">initialize_house_data</a>(house_cap: <a href="house_data.md#0x0_house_data_HouseCap">HouseCap</a>, <a href="">coin</a>: Coin&lt;SUI&gt;, public_key: <a href="">vector</a>&lt;u8&gt;, ctx: &<b>mut</b> TxContext) {
    <b>assert</b>!(<a href="_value">coin::value</a>(&<a href="">coin</a>) &gt; 0, <a href="house_data.md#0x0_house_data_EInsufficientBalance">EInsufficientBalance</a>);

    <b>let</b> <a href="house_data.md#0x0_house_data">house_data</a> = <a href="house_data.md#0x0_house_data_HouseData">HouseData</a> {
        id: <a href="_new">object::new</a>(ctx),
        <a href="">balance</a>: <a href="_into_balance">coin::into_balance</a>(<a href="">coin</a>),
        house: <a href="_sender">tx_context::sender</a>(ctx),
        public_key,
        max_stake: 50_000_000_000, // 50 SUI, 1 SUI = 10^9.
        min_stake: 1_000_000_000, // 1 SUI.
        fees: <a href="_zero">balance::zero</a>(),
        base_fee_in_bp: 100 // 1% in basis points.
    };

    <b>let</b> <a href="house_data.md#0x0_house_data_HouseCap">HouseCap</a> { id } = house_cap;
    <a href="_delete">object::delete</a>(id);

    <a href="_share_object">transfer::share_object</a>(<a href="house_data.md#0x0_house_data">house_data</a>);
}
</code></pre>



</details>

<a name="0x0_house_data_top_up"></a>

## Function `top_up`

Function used to top up the house balance. Can be called by anyone.
House can have multiple accounts so giving the treasury balance is not limited.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_top_up">top_up</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, <a href="">coin</a>: <a href="_Coin">coin::Coin</a>&lt;<a href="_SUI">sui::SUI</a>&gt;, _: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_top_up">top_up</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>, <a href="">coin</a>: Coin&lt;SUI&gt;, _: &<b>mut</b> TxContext) {
    <a href="_put">coin::put</a>(&<b>mut</b> <a href="house_data.md#0x0_house_data">house_data</a>.<a href="">balance</a>, <a href="">coin</a>)
}
</code></pre>



</details>

<a name="0x0_house_data_withdraw"></a>

## Function `withdraw`

House can withdraw the entire balance of the house object.
Caution should be taken when calling this function.
If all funds are withdrawn, it will result in the house
not being able to participate in any more games.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_withdraw">withdraw</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_withdraw">withdraw</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>, ctx: &<b>mut</b> TxContext) {
    // Only the house <b>address</b> can withdraw funds.
    <b>assert</b>!(<a href="_sender">tx_context::sender</a>(ctx) == <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>), <a href="house_data.md#0x0_house_data_ECallerNotHouse">ECallerNotHouse</a>);

    <b>let</b> total_balance = <a href="">balance</a>(<a href="house_data.md#0x0_house_data">house_data</a>);
    <b>let</b> <a href="">coin</a> = <a href="_take">coin::take</a>(&<b>mut</b> <a href="house_data.md#0x0_house_data">house_data</a>.<a href="">balance</a>, total_balance, ctx);
    <a href="_public_transfer">transfer::public_transfer</a>(<a href="">coin</a>, <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>));
}
</code></pre>



</details>

<a name="0x0_house_data_claim_fees"></a>

## Function `claim_fees`

House can withdraw the accumulated fees of the house object.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_claim_fees">claim_fees</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_claim_fees">claim_fees</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>, ctx: &<b>mut</b> TxContext) {
    // Only the house <b>address</b> can withdraw fee funds.
    <b>assert</b>!(<a href="_sender">tx_context::sender</a>(ctx) == <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>), <a href="house_data.md#0x0_house_data_ECallerNotHouse">ECallerNotHouse</a>);

    <b>let</b> total_fees = <a href="house_data.md#0x0_house_data_fees">fees</a>(<a href="house_data.md#0x0_house_data">house_data</a>);
    <b>let</b> <a href="">coin</a> = <a href="_take">coin::take</a>(&<b>mut</b> <a href="house_data.md#0x0_house_data">house_data</a>.fees, total_fees, ctx);
    <a href="_public_transfer">transfer::public_transfer</a>(<a href="">coin</a>, <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>));
}
</code></pre>



</details>

<a name="0x0_house_data_update_max_stake"></a>

## Function `update_max_stake`

House can update the max stake. This allows larger stake to be placed.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_update_max_stake">update_max_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, max_stake: u64, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_update_max_stake">update_max_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>, max_stake: u64, ctx: &<b>mut</b> TxContext) {
    // Only the house <b>address</b> can <b>update</b> the base fee.
    <b>assert</b>!(<a href="_sender">tx_context::sender</a>(ctx) == <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>), <a href="house_data.md#0x0_house_data_ECallerNotHouse">ECallerNotHouse</a>);

    <a href="house_data.md#0x0_house_data">house_data</a>.max_stake = max_stake;
}
</code></pre>



</details>

<a name="0x0_house_data_update_min_stake"></a>

## Function `update_min_stake`

House can update the min stake. This allows smaller stake to be placed.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_update_min_stake">update_min_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>, min_stake: u64, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_update_min_stake">update_min_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>, min_stake: u64, ctx: &<b>mut</b> TxContext) {
    // Only the house <b>address</b> can <b>update</b> the <b>min</b> stake.
    <b>assert</b>!(<a href="_sender">tx_context::sender</a>(ctx) == <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>), <a href="house_data.md#0x0_house_data_ECallerNotHouse">ECallerNotHouse</a>);

    <a href="house_data.md#0x0_house_data">house_data</a>.min_stake = min_stake;
}
</code></pre>



</details>

<a name="0x0_house_data_borrow_balance_mut"></a>

## Function `borrow_balance_mut`

Returns a mutable reference to the balance of the house.


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow_balance_mut">borrow_balance_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): &<b>mut</b> <a href="_Balance">balance::Balance</a>&lt;<a href="_SUI">sui::SUI</a>&gt;
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow_balance_mut">borrow_balance_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): &<b>mut</b> Balance&lt;SUI&gt; {
    &<b>mut</b> <a href="house_data.md#0x0_house_data">house_data</a>.<a href="">balance</a>
}
</code></pre>



</details>

<a name="0x0_house_data_borrow_fees_mut"></a>

## Function `borrow_fees_mut`

Returns a mutable reference to the fees of the house.


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow_fees_mut">borrow_fees_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): &<b>mut</b> <a href="_Balance">balance::Balance</a>&lt;<a href="_SUI">sui::SUI</a>&gt;
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow_fees_mut">borrow_fees_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): &<b>mut</b> Balance&lt;SUI&gt; {
    &<b>mut</b> <a href="house_data.md#0x0_house_data">house_data</a>.fees
}
</code></pre>



</details>

<a name="0x0_house_data_borrow_mut"></a>

## Function `borrow_mut`

Returns a mutable reference to the house id.


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow_mut">borrow_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): &<b>mut</b> <a href="_UID">object::UID</a>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow_mut">borrow_mut</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<b>mut</b> <a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): &<b>mut</b> UID {
    &<b>mut</b> <a href="house_data.md#0x0_house_data">house_data</a>.id
}
</code></pre>



</details>

<a name="0x0_house_data_borrow"></a>

## Function `borrow`

Returns a reference to the house id.


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow">borrow</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): &<a href="_UID">object::UID</a>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b>(<b>friend</b>) <b>fun</b> <a href="house_data.md#0x0_house_data_borrow">borrow</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): &UID {
    &<a href="house_data.md#0x0_house_data">house_data</a>.id
}
</code></pre>



</details>

<a name="0x0_house_data_balance"></a>

## Function `balance`

Returns the balance of the house.


<pre><code><b>public</b> <b>fun</b> <a href="">balance</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="">balance</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): u64 {
    <a href="_value">balance::value</a>(&<a href="house_data.md#0x0_house_data">house_data</a>.<a href="">balance</a>)
}
</code></pre>



</details>

<a name="0x0_house_data_house"></a>

## Function `house`

Returns the address of the house.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): <b>address</b>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_house">house</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): <b>address</b> {
    <a href="house_data.md#0x0_house_data">house_data</a>.house
}
</code></pre>



</details>

<a name="0x0_house_data_public_key"></a>

## Function `public_key`

Returns the public key of the house.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_public_key">public_key</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): <a href="">vector</a>&lt;u8&gt;
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_public_key">public_key</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): <a href="">vector</a>&lt;u8&gt; {
    <a href="house_data.md#0x0_house_data">house_data</a>.public_key
}
</code></pre>



</details>

<a name="0x0_house_data_max_stake"></a>

## Function `max_stake`

Returns the max stake of the house.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_max_stake">max_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_max_stake">max_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): u64 {
    <a href="house_data.md#0x0_house_data">house_data</a>.max_stake
}
</code></pre>



</details>

<a name="0x0_house_data_min_stake"></a>

## Function `min_stake`

Returns the min stake of the house.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_min_stake">min_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_min_stake">min_stake</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): u64 {
    <a href="house_data.md#0x0_house_data">house_data</a>.min_stake
}
</code></pre>



</details>

<a name="0x0_house_data_fees"></a>

## Function `fees`

Returns the fees of the house.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_fees">fees</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_fees">fees</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): u64 {
    <a href="_value">balance::value</a>(&<a href="house_data.md#0x0_house_data">house_data</a>.fees)
}
</code></pre>



</details>

<a name="0x0_house_data_base_fee_in_bp"></a>

## Function `base_fee_in_bp`

Returns the base fee.


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_base_fee_in_bp">base_fee_in_bp</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">house_data::HouseData</a>): u16
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="house_data.md#0x0_house_data_base_fee_in_bp">base_fee_in_bp</a>(<a href="house_data.md#0x0_house_data">house_data</a>: &<a href="house_data.md#0x0_house_data_HouseData">HouseData</a>): u16 {
    <a href="house_data.md#0x0_house_data">house_data</a>.base_fee_in_bp
}
</code></pre>



</details>
