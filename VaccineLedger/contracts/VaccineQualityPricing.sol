// VaccineQualityPricing.sol
pragma solidity ^0.8.0;

contract VaccineQualityPricing {
    struct VaccineBatch {
        bytes32 batchId;
        uint256 totalDoses;
        uint8 qualityScore; // 0-100
        uint256 basePricePerDose;
        uint256 finalPrice;
        uint256 recordedAt;
        bool priced;
    }

    mapping(bytes32 => VaccineBatch) public batches;
    mapping(bytes32 => uint8[]) public temperatureHistory;

    event BatchPriced(
        bytes32 indexed batchId,
        uint256 finalPrice,
        uint8 qualityScore
    );
    event QualityAlert(bytes32 indexed batchId, string reason);

    // Volume discounts (decreases with lower quality)
    function calculateVolumeDiscount(
        uint256 totalDoses,
        uint8 qualityScore
    ) public pure returns (uint256) {
        // Base discount structure
        uint256 volumeDiscount = 0;

        if (totalDoses > 10000) {
            volumeDiscount = 15; // 15% discount for bulk
        } else if (totalDoses > 5000) {
            volumeDiscount = 10; // 10% discount
        } else if (totalDoses > 1000) {
            volumeDiscount = 5; // 5% discount
        }

        // Quality adjustment (reduce discount for lower quality)
        if (qualityScore < 70) {
            volumeDiscount = volumeDiscount / 2; // Half the discount
        }
        if (qualityScore < 50) {
            volumeDiscount = 0; // No discount, recommend destruction
        }

        return volumeDiscount;
    }

    function priceBatch(
        bytes32 batchId,
        uint256 totalDoses,
        uint8 qualityScore,
        uint256 basePricePerDose
    ) external returns (uint256 finalPrice) {
        require(!batches[batchId].priced, "Batch already priced");
        require(qualityScore <= 100, "Invalid quality score");

        // Calculate volume discount
        uint256 volumeDiscount = calculateVolumeDiscount(
            totalDoses,
            qualityScore
        );

        // Apply quality adjustment
        uint256 qualityMultiplier = (qualityScore * 100) / 100; // 1.0 at score 100

        // Final price calculation
        finalPrice = (basePricePerDose * (100 - volumeDiscount)) / 100;
        finalPrice = (finalPrice * qualityScore) / 100;

        // Store batch
        batches[batchId] = VaccineBatch({
            batchId: batchId,
            totalDoses: totalDoses,
            qualityScore: qualityScore,
            basePricePerDose: basePricePerDose,
            finalPrice: finalPrice,
            recordedAt: block.timestamp,
            priced: true
        });

        // Generate alerts if needed
        if (qualityScore < 70) {
            emit QualityAlert(
                batchId,
                "Quality below 70 - reduced discount applied"
            );
        }
        if (qualityScore < 50) {
            emit QualityAlert(
                batchId,
                "Quality below 50 - RECOMMEND DESTRUCTION"
            );
        }

        emit BatchPriced(batchId, finalPrice, qualityScore);
        return finalPrice;
    }

    function getPriceAdjustment(
        bytes32 batchId
    )
        external
        view
        returns (
            uint256 originalPrice,
            uint256 adjustedPrice,
            uint8 percentageChange
        )
    {
        VaccineBatch memory batch = batches[batchId];
        require(batch.priced, "Batch not yet priced");

        uint256 original = batch.basePricePerDose * batch.totalDoses;
        uint256 adjusted = batch.finalPrice * batch.totalDoses;

        int256 change = int256(adjusted) - int256(original);
        percentageChange = uint8(uint256((change * 100) / int256(original)));
        return (original, adjusted, percentageChange);
    }

    // Example: Volume-based incentive for better conditions
    function getVolumeIncentive(
        bytes32 batchId
    ) external view returns (string memory incentive) {
        VaccineBatch memory batch = batches[batchId];

        if (batch.totalDoses > 10000 && batch.qualityScore > 90) {
            return "Platinum Tier: 15% volume discount + 10% quality bonus";
        } else if (batch.totalDoses > 5000 && batch.qualityScore > 85) {
            return "Gold Tier: 10% volume discount + 5% quality bonus";
        } else if (batch.totalDoses > 1000 && batch.qualityScore > 80) {
            return "Silver Tier: 5% volume discount";
        } else if (batch.qualityScore < 50) {
            return "REJECT: Quality compromised";
        }

        return "Standard pricing applied";
    }
}
