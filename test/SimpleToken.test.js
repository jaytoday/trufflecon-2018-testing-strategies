const SimpleToken = artifacts.require('SimpleToken');
const CapValidator = artifacts.require('CapValidator');

contract('SimpleToken', function(accounts) {
  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];
  const investorTooFar = accounts[3];
  const initialSupply = 10000;

  before(async () => {
    this.capValidator = await CapValidator.deployed();
    this.simpleToken = await SimpleToken.deployed();
  });

  it('should assign the INITIAL_SUPPLY to the owner', async () => {
    this.ownerBalance = await this.simpleToken.balanceOf.call(owner);
    assert.equal(this.ownerBalance.toNumber(), initialSupply);
  });

  it('should initially have an investorCount of 1', async () => {
    this.investorCount = await this.capValidator.investorCount.call();
    assert.equal(this.investorCount.toNumber(), 1);
  });

  it('should allow the owner to transfer to another address', async () => {
    const amount = 100;

    await this.simpleToken.transfer(alice, amount, {from:owner});

    this.ownerBalance = await this.simpleToken.balanceOf.call(owner);
    assert.equal(this.ownerBalance.toNumber(), initialSupply - amount);

    this.aliceBalance = await this.simpleToken.balanceOf.call(alice);
    assert.equal(this.aliceBalance.toNumber(), amount);
  });

  it('should have an investorCount of 2 after new transfer', async () => {
    this.investorCount = await this.capValidator.investorCount.call();
    assert.equal(this.investorCount.toNumber(), 2);
  });

  it('should allow a non-owner to transfer to another new address', async () => {
    const amount = 10;
    const alicePreBalance = this.aliceBalance;

    await this.simpleToken.transfer(bob, amount, {from:alice});

    this.aliceBalance = await this.simpleToken.balanceOf.call(alice);
    assert.equal(this.aliceBalance.toNumber(), alicePreBalance - amount);

    this.bobBalance = await this.simpleToken.balanceOf.call(bob);
    assert.equal(this.bobBalance.toNumber(), amount);
  });

  it('should have an investorCount of 3 after new transfer', async () => {
    this.investorCount = await this.capValidator.investorCount.call();
    assert.equal(this.investorCount.toNumber(), 3);
  });

  it('should allow a transfer to not new address', async () => {
    const amount = 10;
    const alicePreBalance = this.aliceBalance;
    const bobPreBalance = this.bobBalance;

    await this.simpleToken.transfer(bob, amount, {from:alice});

    this.aliceBalance = await this.simpleToken.balanceOf.call(alice);
    assert.equal(this.aliceBalance.toNumber(), alicePreBalance - amount);

    this.bobBalance = await this.simpleToken.balanceOf.call(bob);
    assert.equal(this.bobBalance.toNumber(), bobPreBalance.toNumber() + amount);
  });

  it('should still have an investorCount of 3 after not-new transfer', async () => {
    this.investorCount = await this.capValidator.investorCount.call();
    assert.equal(this.investorCount.toNumber(), 3);
  });

  it('should not allow a transfer to a new address if at investorCap', async () => {
    const amount = 10;
    const alicePreBalance = this.aliceBalance;
    const CAP = await this.capValidator.CAP();
    assert.equal(this.investorCount.toNumber(), CAP.toNumber());

    try {
      await this.simpleToken.transfer(investorTooFar, this.ownerBalance, {from:owner});
      assert.isFalse(true, 'Transfer should throw error');
    } catch(err) {
      assert.isTrue(
        err.toString().includes('revert'),
        `Error thrown did not contain "revert" - ${err.toString()}`);
    }
  });

  it('should allow a transfer of full balance', async () => {
    const alicePreBalance = this.aliceBalance;
    const bobPreBalance = this.bobBalance;

    await this.simpleToken.transfer(bob, alicePreBalance, {from:alice});

    this.aliceBalance = await this.simpleToken.balanceOf.call(alice);
    assert.equal(this.aliceBalance.toNumber(), 0);

    this.bobBalance = await this.simpleToken.balanceOf.call(bob);
    assert.equal(this.bobBalance.toNumber(), bobPreBalance.toNumber() + alicePreBalance.toNumber());
  });

  it('should still have an investorCount of 2 after transfer to 0', async () => {
    this.investorCount = await this.capValidator.investorCount.call();
    assert.equal(this.investorCount.toNumber(), 2);
  });
});