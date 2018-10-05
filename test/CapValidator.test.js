const CapValidator = artifacts.require('CapValidator');

contract.only('CapValidator', function(accounts) {
  const expectedCAP = 3;
  const owner = accounts[0];
  const fakeToken = accounts[1];
  const nonOwner = accounts[2];

  let capValidator;

  beforeEach(async () => {
    capValidator = await CapValidator.new({from: owner});
    await capValidator.setInitialInvestorCount(fakeToken, {from:owner});
  });

  it(`should set an investor CAP of ${expectedCAP}`, async () => {
    const CAP = await capValidator.CAP();
    assert.equal(CAP.toNumber(), expectedCAP);
  });

  it('should return investorCount, starting with 1', async () => {
    const expectedCount = 1;
    const count = await capValidator.investorCount(fakeToken);
    assert.equal(count.toNumber(), expectedCount);
  });

  describe('.setInitialInvestorCount', () => {
    const fakeToken2 = accounts[3];

    it('it allows the owner to update a token\'s initialCount to 1', async () => {
      const preInvestorCount = await capValidator.investorCount.call(fakeToken2);
      assert.equal(preInvestorCount.toNumber(), 0);
      await capValidator.setInitialInvestorCount(fakeToken2, {from: owner});
      const postInvestorCount = await capValidator.investorCount.call(fakeToken2);
      assert.equal(postInvestorCount.toNumber(), 1);
    });

    it('it reverts if called for token with Count', async () => {
      const preInvestorCount = await capValidator.investorCount.call(fakeToken);
      assert.equal(preInvestorCount.toNumber(), 1);
      try {
        await capValidator.setInitialInvestorCount(fakeToken, {from: owner});
        assert.fail('Transfer should throw error');
      } catch(err) {
        assert.isTrue(
          err.toString().includes('revert'),
          `Error thrown did not contain "revert" - ${err.toString()}`);
      }
    });

    it('it reverts if call by non-owner', async () => {
      const preInvestorCount = await capValidator.investorCount.call(fakeToken2);
      assert.equal(preInvestorCount.toNumber(), 0);
      
      try {
        await capValidator.setInitialInvestorCount(fakeToken2, {from: nonOwner});
        assert.fail('Transfer should throw error');
      } catch(err) {
        assert.isTrue(
          err.toString().includes('revert'),
          `Error thrown did not contain "revert" - ${err.toString()}`);
      }
    });
  });

  describe('.validate', () => {
    it('it returns true when toIsNew and !fromIsLeaving; add to investorCount', async () => {
      const preInvestorCount = await capValidator.investorCount.call(fakeToken);
      const result = await capValidator.validate.call(10, 0, 1, {from: fakeToken});
      assert.isTrue(result, 'Should be true for toIsNew and !fromIsLeaving');
      await capValidator.validate(10, 0, 1, {from: fakeToken});
      const investorCount = await capValidator.investorCount.call(fakeToken);
      assert.equal(investorCount.toNumber(), preInvestorCount.toNumber() + 1);
    });

    it('it returns true when !toIsNew and !fromIsLeaving; not change investorCount', async () => {
      const preInvestorCount = await capValidator.investorCount.call(fakeToken);
      const result = await capValidator.validate.call(10, 10, 1, {from: fakeToken});
      assert.isTrue(result, 'Should be true for !toIsNew and !fromIsLeaving');

      await capValidator.validate(10, 10, 1, {from: fakeToken});
      const investorCount = await capValidator.investorCount.call(fakeToken);
      assert.equal(investorCount.toNumber(), preInvestorCount.toNumber());
    });

    it('it returns true when !toIsNew and fromIsLeaving; decrease investorCount', async () => {
      const preInvestorCount = await capValidator.investorCount.call(fakeToken);
      const result = await capValidator.validate.call(10, 10, 10, {from: fakeToken});
      assert.isTrue(result, 'Should be true for !toIsNew and fromIsLeaving');

      await capValidator.validate(10, 10, 10, {from: fakeToken});
      const investorCount = await capValidator.investorCount.call(fakeToken);
      assert.equal(investorCount.toNumber(), preInvestorCount.toNumber() - 1);
    });
  });
});
