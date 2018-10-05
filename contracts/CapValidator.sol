pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

/**
 * THIS CODE IS FOR DEMOSTRATION PURPOSES ONLY!!! 
 *
 * DO NOT USE IN PRODUCTION!!!
 */

contract CapValidator is Ownable {
    using SafeMath for uint;

    uint256 public constant CAP = 3;
    mapping(address => uint) internal investorCounts_;

    function investorCount(address token) public view returns(uint) {
        return investorCounts_[token];
    }

    function validate(
        uint fromBalance,
        uint toBalance,
        uint amount
    ) 
        public
        returns (bool)
    {
        bool toIsNew = (toBalance == 0);
        bool fromIsLeaving = (fromBalance.sub(amount) == 0);

        if (toIsNew && !fromIsLeaving) {
            if (investorCounts_[msg.sender].add(1) > CAP) {
                return false;
            }
            investorCounts_[msg.sender] = investorCounts_[msg.sender].add(1);
            return true;
        }

        if (!toIsNew && fromIsLeaving) {
            investorCounts_[msg.sender] = investorCounts_[msg.sender].sub(1);
            return true;
        }

        return true;
    }

    function setInitialInvestorCount(address token) 
        public
        onlyOwner
    {
        require(investorCounts_[token] == 0, "investorCount must be 0");
        investorCounts_[token] = 1;
    }
}