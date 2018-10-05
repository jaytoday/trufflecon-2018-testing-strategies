pragma solidity ^0.4.24;

import "openzeppelin-solidity/contracts/token/ERC20/StandardToken.sol";

import {CapValidator as iValidator} from "./CapValidator.sol";

/**
 * @title SimpleToken
 * @dev Very simple ERC20 Token example, where all tokens are pre-assigned to the creator.
 * Note they can later distribute these tokens as they wish using `transfer` and other
 * `StandardToken` functions.
 */
contract SimpleToken is StandardToken {

    string public constant name = "SimpleToken"; // solium-disable-line uppercase
    string public constant symbol = "SIM"; // solium-disable-line uppercase
    uint8 public constant decimals = 1;

    uint256 public constant INITIAL_SUPPLY = 10000;

    iValidator internal validator_;

    /**
    * @dev Constructor that gives msg.sender all of existing tokens.
    */
    constructor(iValidator _validator) public {
        validator_ = _validator;
        totalSupply_ = INITIAL_SUPPLY;
        balances[msg.sender] = INITIAL_SUPPLY;
        emit Transfer(address(0), msg.sender, INITIAL_SUPPLY);
    }

    function transfer(address _to, uint256 _value) 
        public
        returns (bool success)
    {
        require(validator_.validate(balances[msg.sender], balances[_to], _value), "Transfer invalid");
        super.transfer(_to, _value);

        return true;
    }
}