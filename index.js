const { ethers } = require("ethers");
require('dotenv').config();

const provider = new ethers.JsonRpcProvider(process.env.ARB_RPC_URL);
const signer = new ethers.Wallet(process.env.SIGNING_KEY, provider);
const ABI = new ethers.Interface([
    "function selectClusters()", 
    "function EPOCH_LENGTH() view returns(uint256)", 
    "function MAX_REWARD_FOR_CLUSTER_SELECTION() view returns(uint256)",
    "function refundGasForClusterSelection() view returns(uint256)",
    "function getCurrentEpoch() view returns(uint256)",
    "function getClusters(uint256 epochNumber) view returns(address[])"
]);
const contractAddress = process.env.CLUSTER_SELECTOR_ADDRESS;
const contract = new ethers.Contract(contractAddress, ABI, provider);

async function handleSelectionRepeat() {
    const epochLength = parseInt(await contract.EPOCH_LENGTH());
    const maxReward = await contract.MAX_REWARD_FOR_CLUSTER_SELECTION();

    await selectClusters(maxReward);
    setInterval(async () => {
        await selectClusters(maxReward);
    }, epochLength*1000);
}

async function handleSelection() {
    await selectClusters();
}

async function selectClusters() {
    try {
        const epoch = Number(await contract.getCurrentEpoch());
        console.log(`${(new Date()).toJSON()} Current Epoch is  ${epoch}`);
        try {
            await contract.getClusters(epoch+1);
            console.log(`${new Date().toJSON()} Clusters already selected for epoch ${epoch+1}`);
            console.log(`${new Date().toJSON()} Waiting to select clusters for epoch ${epoch+2}`);
            return;
        } catch(e) { console.log(`${new Date().toJSON()} Clusters not yet selected for epoch ${epoch+1}`); }

        console.log(`${new Date().toJSON()} Preparing tx to select clusters for epoch ${epoch+1}`);
        const tx = await contract.connect(signer).selectClusters();
        console.log(`${new Date().toJSON()} Tx submitted to select clusters for epoch ${epoch+1}. Hash: ${tx.hash}`);
        const receipt = await tx.wait();
        if(receipt.status == 1) {
            console.log(`${new Date().toJSON()} SUCCESS: Clusters selected for epoch ${epoch+1}. Hash: ${tx.hash}`);
        } else {
            console.log(`${new Date().toJSON()} FAILED: Missed clusters selection for epoch ${epoch+1}. Hash: ${tx.hash}`);
        }
    } catch(error) {
        console.log(`${new Date().toJSON()} FAILED: Cluster Selection for Epoch didn't go through ${error}`);
    }
}

module.exports = {
    handleSelection,
    handleSelectionRepeat
}