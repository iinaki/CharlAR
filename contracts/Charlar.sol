// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract CharlAR is ERC721 {
    address public owner;
    uint256 private total_channels = 1;
    uint256 public total_supply;

    struct Channel {
        uint256 id;
        string name;
        uint256 cost_to_join;
    }

    mapping(uint256 => Channel) private channels;
    mapping(uint256 => mapping(address => bool)) public has_joined_channel;

    modifier only_owner() {
        require(msg.sender == owner, "Only owner can create channels"); //no me gusta esto
        _;
    }

    constructor() ERC721("CharlAR", "CHRLR") {
        owner = msg.sender;
    }

    function create_channel(string memory _name, uint256 _cost_to_join) public only_owner {
        channels[total_channels] = Channel(total_channels, _name, _cost_to_join);
        total_channels++;
    }

    function mint_nft_to_join_channel(uint256 _channel_id) public payable {
        require(_channel_id > 0, "Channel ID must be greater than 0");
        require(_channel_id < total_channels, "Channel does not exist");
        require(has_joined_channel[_channel_id][msg.sender] == false, "you have already joined channel");
        require(msg.value >= channels[_channel_id].cost_to_join, "you dont have enough ETH to join this channel");

        has_joined_channel[_channel_id][msg.sender] = true;
        total_supply++;
        _safeMint(msg.sender, total_supply);
    }

    function get_channel(uint256 _id) public view returns (Channel memory) {
        return channels[_id];
    }

    function withdraw() public only_owner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Withdraw transfer failed :(");
    }
}
