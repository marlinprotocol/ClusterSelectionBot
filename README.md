# Cluster Selection Bot

A script to select clusters on Marlin network at every epoch.

## Installation

Nodejs can be installed using instructions [here](https://nodejs.org/en/download/package-manager) and then install dependencies using  `npm i`.

## How to run ?

Create a `.env` file based on `.env.example`. Fill the following fields

```
# url for Arbitrum One RPC
ARB_RPC_URL=
# Private key of the address used to send txs for cluster selection
SIGNING_KEY=
# Address of the cluster selector contract
CLUSTER_SELECTOR_ADDRESS=
```

`CLUSTER_SELECTOR_ADDRESS` for Eth based network on arbitrum one mainnet is `0xf1E4c2d4B2996C7c34b5a6136861D7385Cb0E843`([link](https://arbiscan.io/address/0xf1E4c2d4B2996C7c34b5a6136861D7385Cb0E843)).

Script to select clusters can be run by using `npm start`.

## Reward

Invoking cluster selection for an epoch is essential to ensure there is a churn in clusters selected for propagation in the network which results in selected clusters being able to propagate blocks in the network and receive tickets. Tickets when submitted by receivers will result in selected clusters being rewarded. This ensures there is a inbuilt incentive for clusters who aren't selected in an epoch to invoke cluster selection. 

To bootstrap this process a refund for transaction fee for cluster selection is given to `msg.sender` of the tx that selects clusters for an epoch in `ETH`. Clusters are free to topup this fund so that cluster selection happens at every epoch.

### Calculation of reward

Transaction cost on Arbitrum has 2 components

1. L2 execution and storage cost
2. L1 calldata cost

L2 execution and storage cost can be calculated by gas used to execute `selectClusters` method. Based on simulations a worst case gas cost (which won't be reached in most cases) will be used to cover the L2 gas cost as well as give a small reward.

L1 calldata cost is calculated based on ArbGasInfo [precompile](https://developer.arbitrum.io/arbos/precompiles). Base gas fee for L2 tx and the calldata (only method sig which is 4 bytes) are considered as part of this cost.

Sum of the above costs are considered towards calculation of rewards.