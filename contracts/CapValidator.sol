pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract CapValidator {
    using SafeMath for uint;

    uint256 public constant CAP = 3;
    uint256 public investorCount_ = 1;

    function investorCount() public view returns(uint) {
        return investorCount_;
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
            if (investorCount_.add(1) > CAP) {
                return false;
            }
            investorCount_ = investorCount_.add(1);
            return true;
        }

        if (!toIsNew && fromIsLeaving) {
            investorCount_ = investorCount_.sub(1);
            return true;
        }

        return true;
    }
}