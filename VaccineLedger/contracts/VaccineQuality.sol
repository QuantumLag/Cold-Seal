// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

//like a class in python
contract VaccineLedger {
    //custom data package
    struct Telemetry {
        uint256 temp; // We will store 5.5°C as 55(since decimal num not allowed in solidity)
        string gps;
        uint256 timestamp;
    }

    mapping(uint256 => Telemetry) public history;
    //give an ID it gives you back the telemetry for the id
    //public means anybody with the id can view it
    uint256 public logCount;
    //to track how many times our data has been logged
    uint256 public integrityScore = 10000; // 100.00%
    uint256 public decayRate = 3; // Controls how slow it drops

    //entry point for the iot sensor
    function logData(uint256 _temp, string memory _gps) public {
        logCount++;
        //take the elements in the telemetry struct and lock them into the current slot
        history[logCount] = Telemetry(_temp, _gps, block.timestamp);

        // Logic: If tem is NOT between 2.0°C (20) and 8.0°C (80)
        if (_temp < 20 || _temp > 80) {
            // Exponential Decay: Current Score * 0.97
            integrityScore = (integrityScore * (1000 - decayRate)) / 1000;
            //this is how biological vaccines actually degrade
        }
    }
    //dashboard function is a zero gas function because we are just reading, and not doing any
    //transaction in the blockchain
    function getUIStatus() public view returns (uint256 score, uint256 lastTemp, string memory lastGps) {
        return (
            integrityScore / 100, // Returns 0-100 for your gauge
            history[logCount].temp,
            history[logCount].gps
        );
    }
}