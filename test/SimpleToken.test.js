const SimpleToken = artifacts.require('SimpleToken');
const CapValidator = artifacts.require('CapValidator');

contract('SimpleToken', function(accounts) {
  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const investorTooFar = accounts[3];
  const initialSupply = 10000;

  let capValidator;
  let simpleToken;
  
  beforeEach(async () => {
    capValidator = await CapValidator.new({from: owner});
    simpleToken = await SimpleToken.new(capValidator.address, {from:owner});
  })

  it('should assign the INITIAL_SUPPLY to the owner', async () => {
    this.ownerBalance = await simpleToken.balanceOf.call(owner);
    assert.equal(this.ownerBalance.toNumber(), initialSupply);
  });

  it('should initially have an investorCount of 1', async () => {
    this.investorCount = await capValidator.investorCount.call();
    assert.equal(this.investorCount.toNumber(), 1);
  });

  it('should allow the owner to transfer to another address and increase investorCount', async () => {
    const amount = 100;

    await simpleToken.transfer(alice, amount, {from:owner});

    const ownerBalance = await simpleToken.balanceOf.call(owner);
    assert.equal(ownerBalance.toNumber(), initialSupply - amount);

    const aliceBalance = await simpleToken.balanceOf.call(alice);
    assert.equal(aliceBalance.toNumber(), amount);
    
    const investorCount = await capValidator.investorCount.call();
    assert.equal(investorCount.toNumber(), 2);
  });

  it('should allow a non-owner to transfer to another new address and increase investorCount', async () => {
    const amount = 10;
    await simpleToken.transfer(alice, amount * 2, {from:owner});

    const preInvestorCount = await capValidator.investorCount.call();
    assert.equal(preInvestorCount.toNumber(), 2);
    
    const alicePreBalance = await simpleToken.balanceOf.call(alice);
    assert.isAbove(alicePreBalance.toNumber(), amount);

    await simpleToken.transfer(bob, amount, {from:alice});
    
    const aliceBalance = await simpleToken.balanceOf.call(alice);
    assert.equal(aliceBalance.toNumber(), alicePreBalance - amount);
    
    const bobBalance = await simpleToken.balanceOf.call(bob);
    assert.equal(bobBalance.toNumber(), amount);
    
    const investorCount = await capValidator.investorCount.call();
    assert.equal(investorCount.toNumber(), 3);
  });

  describe('when investorCount === CAP', () => {
    beforeEach(async () => {
      const amount = 10;
      const CAP = await capValidator.CAP();
    
      let alicePreBalance = await simpleToken.balanceOf.call(alice);
      let bobPreBalance = await simpleToken.balanceOf.call(bob);
      let investorCount = await capValidator.investorCount.call();
      assert.equal(investorCount.toNumber(), 1);
      
      await simpleToken.transfer(alice, amount, {from:owner});
      alicePreBalance = await simpleToken.balanceOf.call(alice);
      assert.equal(alicePreBalance.toNumber(), amount);

      await simpleToken.transfer(bob, amount, {from:owner});
      bobPreBalance = await simpleToken.balanceOf.call(bob);
      assert.equal(bobPreBalance.toNumber(), amount);

      investorCount = await capValidator.investorCount.call();
      assert.equal(investorCount.toNumber(), CAP.toNumber());
    });

    it('should allow a transfer to not new address when at CAP', async () => {
      const amount = 10;
      const alicePreBalance = await simpleToken.balanceOf.call(alice);
      const bobPreBalance = await simpleToken.balanceOf.call(bob);
      
      await simpleToken.transfer(bob, amount, {from:alice});
  
      const aliceBalance = await simpleToken.balanceOf.call(alice);
      assert.equal(aliceBalance.toNumber(), alicePreBalance.toNumber() - amount);
  
      const bobBalance = await simpleToken.balanceOf.call(bob);
      assert.equal(bobBalance.toNumber(), bobPreBalance.toNumber() + amount);
    });

    it('should not allow a transfer to a new address', async () => {
      const amount = 10;
      const ownerBalance = await simpleToken.balanceOf.call(owner);
      assert.isAbove(ownerBalance.toNumber(), amount);

      try {
        await simpleToken.transfer(investorTooFar, amount, {from:owner});
        assert.isFalse(true, 'Transfer should throw error');
      } catch(err) {
        assert.isTrue(
          err.toString().includes('revert'),
          `Error thrown did not contain "revert" - ${err.toString()}`);
      }
    });
    
    it('should allow a transfer of full balance', async () => {
      const alicePreBalance = await simpleToken.balanceOf.call(alice);
  
      await simpleToken.transfer(investorTooFar, alicePreBalance, {from:alice});
  
      const aliceBalance = await simpleToken.balanceOf.call(alice);
      assert.equal(aliceBalance.toNumber(), 0);
  
      const investorTooFarBalance = await simpleToken.balanceOf.call(investorTooFar);
      assert.equal(investorTooFarBalance.toNumber(), alicePreBalance.toNumber());

      const investorCount = await capValidator.investorCount.call();
      assert.equal(investorCount.toNumber(), 3);
    });
  });
});