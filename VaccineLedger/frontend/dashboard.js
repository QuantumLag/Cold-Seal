// web3 interaction example
const Web3 = require('web3');
const web3 = new Web3('http://localhost:7545');  // Ganache

async function priceVaccineBatch(batchId, totalDoses, qualityScore, basePricePerDose) {
    const contractAddress = '0x...';  // Your deployed contract
    const contract = new web3.eth.Contract(ABI, contractAddress);
    
    // Call smart contract
    const tx = await contract.methods.priceBatch(
        web3.utils.keccak256(batchId),
        totalDoses,
        qualityScore,
        web3.utils.toWei(basePricePerDose, 'ether')
    ).send({from: ownerAddress});
    
    // Get price adjustment
    const adjustment = await contract.methods.getPriceAdjustment(
        web3.utils.keccak256(batchId)
    ).call();
    
    return {
        originalPrice: web3.utils.fromWei(adjustment.originalPrice, 'ether'),
        adjustedPrice: web3.utils.fromWei(adjustment.adjustedPrice, 'ether'),
        percentageChange: adjustment.percentageChange
    };
}

// Display in dashboard
function displayQualityPricing(batchId) {
    priceVaccineBatch(batchId, 5000, 87, 2.5).then(result => {
        document.getElementById('pricing-info').innerHTML = `
            <h3>Batch ${batchId}</h3>
            <p>Original Price: $${result.originalPrice}</p>
            <p>Adjusted Price: $${result.adjustedPrice}</p>
            <p>Change: ${result.percentageChange}%</p>
        `;
    });
}
