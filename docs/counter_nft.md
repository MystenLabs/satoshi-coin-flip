
<a name="0x0_counter_nft"></a>

# Module `0x0::counter_nft`

This module implements a simple, non transferable counter NFT.
Creates a counter object that can be incremented and burned.
Utilized as a unique VRF input for each satoshi coin flip game.


-  [Resource `Counter`](#0x0_counter_nft_Counter)
-  [Function `burn`](#0x0_counter_nft_burn)
-  [Function `mint`](#0x0_counter_nft_mint)
-  [Function `transfer_to_sender`](#0x0_counter_nft_transfer_to_sender)
-  [Function `get_vrf_input_and_increment`](#0x0_counter_nft_get_vrf_input_and_increment)
-  [Function `count`](#0x0_counter_nft_count)
-  [Function `increment`](#0x0_counter_nft_increment)


<pre><code><b>use</b> <a href="">0x1::vector</a>;
<b>use</b> <a href="">0x2::bcs</a>;
<b>use</b> <a href="">0x2::object</a>;
<b>use</b> <a href="">0x2::transfer</a>;
<b>use</b> <a href="">0x2::tx_context</a>;
</code></pre>



<a name="0x0_counter_nft_Counter"></a>

## Resource `Counter`

Counter object that is used as a unique VRF input for each satoshi coin flip game.
To achieve this, the Counter NFT is flattened into a vector<u64> value containing the Counter NFT ID + the current count.


<pre><code><b>struct</b> <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a> <b>has</b> key
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
<code>count: u64</code>
</dt>
<dd>

</dd>
</dl>


</details>

<a name="0x0_counter_nft_burn"></a>

## Function `burn`

Deletes a counter object.


<pre><code>entry <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_burn">burn</a>(self: <a href="counter_nft.md#0x0_counter_nft_Counter">counter_nft::Counter</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code>entry <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_burn">burn</a>(self: <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a>) {
    <b>let</b> <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a> { id, count: _ } = self;
    <a href="_delete">object::delete</a>(id);
}
</code></pre>



</details>

<a name="0x0_counter_nft_mint"></a>

## Function `mint`

Creates a new counter object. Used in combination with the transfer_to_sender method to provide the same
UX when creating a Counter NFT for the first time.


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_mint">mint</a>(ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>): <a href="counter_nft.md#0x0_counter_nft_Counter">counter_nft::Counter</a>
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_mint">mint</a>(ctx: &<b>mut</b> TxContext): <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a> {
    <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a> {
        id: <a href="_new">object::new</a>(ctx),
        count: 0
    }
}
</code></pre>



</details>

<a name="0x0_counter_nft_transfer_to_sender"></a>

## Function `transfer_to_sender`

Transfers a counter object to the sender.


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_transfer_to_sender">transfer_to_sender</a>(counter: <a href="counter_nft.md#0x0_counter_nft_Counter">counter_nft::Counter</a>, ctx: &<b>mut</b> <a href="_TxContext">tx_context::TxContext</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_transfer_to_sender">transfer_to_sender</a>(counter: <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a>, ctx: &<b>mut</b> TxContext) {
    <a href="_transfer">transfer::transfer</a>(counter, <a href="_sender">tx_context::sender</a>(ctx));
}
</code></pre>



</details>

<a name="0x0_counter_nft_get_vrf_input_and_increment"></a>

## Function `get_vrf_input_and_increment`

Calculates the Counter NFT ID + count and returns the appended result as a vector<u8>.
Then it increases the count by 1 and returns the appended bytes.


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_get_vrf_input_and_increment">get_vrf_input_and_increment</a>(self: &<b>mut</b> <a href="counter_nft.md#0x0_counter_nft_Counter">counter_nft::Counter</a>): <a href="">vector</a>&lt;u8&gt;
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_get_vrf_input_and_increment">get_vrf_input_and_increment</a>(self: &<b>mut</b> <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a>): <a href="">vector</a>&lt;u8&gt; {
    <b>let</b> vrf_input = <a href="_id_bytes">object::id_bytes</a>(self);
    <b>let</b> count_to_bytes = <a href="_to_bytes">bcs::to_bytes</a>(&<a href="counter_nft.md#0x0_counter_nft_count">count</a>(self));
    <a href="_append">vector::append</a>(&<b>mut</b> vrf_input, count_to_bytes);
    <a href="counter_nft.md#0x0_counter_nft_increment">increment</a>(self);
    vrf_input
}
</code></pre>



</details>

<a name="0x0_counter_nft_count"></a>

## Function `count`

Returns the current count of the counter object.


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_count">count</a>(self: &<a href="counter_nft.md#0x0_counter_nft_Counter">counter_nft::Counter</a>): u64
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>public</b> <b>fun</b> <a href="counter_nft.md#0x0_counter_nft_count">count</a>(self: &<a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a>): u64 {
    self.count
}
</code></pre>



</details>

<a name="0x0_counter_nft_increment"></a>

## Function `increment`

Internal function to increment the counter by 1.


<pre><code><b>fun</b> <a href="counter_nft.md#0x0_counter_nft_increment">increment</a>(self: &<b>mut</b> <a href="counter_nft.md#0x0_counter_nft_Counter">counter_nft::Counter</a>)
</code></pre>



<details>
<summary>Implementation</summary>


<pre><code><b>fun</b> <a href="counter_nft.md#0x0_counter_nft_increment">increment</a>(self: &<b>mut</b> <a href="counter_nft.md#0x0_counter_nft_Counter">Counter</a>) {
    self.count = self.count + 1;
}
</code></pre>



</details>
