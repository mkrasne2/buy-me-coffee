//SPDX-License-Identifier: MIT
pragma solidity ^0.8.16;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Coffeefriends {
    
    AggregatorV3Interface internal priceFeed;
    using Counters for Counters.Counter;

    struct Contribution {
        address from;
        uint256 timestamp;
        uint256 value;
        string name;
        string message;
    }

    Contribution[] public contributions;

    mapping(address => uint256) contributors;
    event contributedFunds(Contribution indexed contribution);
    address payable owner;

    constructor() {
        priceFeed = AggregatorV3Interface(0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada);
        owner  =  payable(msg.sender);
    }

    function getLatestPrice() public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }

    function buyCoffee(string memory _name, string memory _message) external payable returns (string memory _contributed){
        require(msg.value >= .001 ether, "I can't buy a coffee for that cheap!");
        contributors[msg.sender] += msg.value;
        Contribution memory newContribution = Contribution(msg.sender, block.timestamp, msg.value, _name, _message);
        contributions.push(newContribution);
        emit contributedFunds(newContribution);
        _contributed = 'Thank you for buying me a coffee!';
    }

    function withdraw() public onlyOwner {
    uint amount = address(this).balance;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Failed to withdraw Matic");
    } 

    function fetchContributions() public view returns (Contribution[] memory _contributions){
        _contributions = contributions;
    }

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }


}
