# gatsby-plugin-bch-split

This is a UI plugin for [bch-wallet-starter](https://github.com/Permissionless-Software-Foundation/bch-wallet-starter). It was forked from [gatsby-plugin-bch-sweep](https://github.com/Permissionless-Software-Foundation/gatsby-plugin-bch-sweep). The intent of this plugin is to help users split their BCH and SLP between the BCHN and ABC networks after the fork on November 15th, 2020.

Whereas the 'sweep' plugin is concerned with sweeping BCH and SLP tokens from a paper wallet. This variation on that plugin will attempt to split the BCH and SLP between the BCHN and ABC networks and deposit each into a new address on each network.

The UI asks a user to specify a `bitcoincash` or `simpleledger` address on each network. It will then allow the user to sweep a paper wallet. The app will attempt to send the UTXOs from the paper to each address by sending the same transaction to both networks simultaneously.

*WARNING:* There is no guarentee that this software works. Splitting BCH and SLP tokens is delicate and dangerous. If you coins are split to BCHN and then a reorg of the blockchain happens, there is no guarentee where your BCH or SLP tokens will end up. However, the split coins on the ABC chain will be more predicatable. See [this article](https://psfoundation.cash/blog/q3-progress-report) for more information.

## License
[MIT](./LICENSE.md)
