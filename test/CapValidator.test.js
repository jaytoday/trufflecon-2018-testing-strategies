const CapValidator = artifacts.require('CapValidator');

contract.only('CapValidator', function(accounts) {
  const expectedCAP = 3;
  const owner = accounts[0];

  let capValidator;

  beforeEach(async () => {
    capValidator = await CapValidator.new({from: owner});
  });

  it(`should set an investor CAP of ${expectedCAP}`, async () => {
    const CAP = await capValidator.CAP();
    assert.equal(CAP.toNumber(), expectedCAP);
  });

  it('should return investorCount, starting with 1', async () => {
    const expectedCount = 1;
    const count = await capValidator.investorCount();
    assert.equal(count, expectedCount);
  });

  describe('.validate', () => {
    it('it returns true when toIsNew and !fromIsLeaving; add to investorCount', async () => {
      const preInvestorCount = await capValidator.investorCount.call();
      const result = await capValidator.validate.call(10, 0, 1);
      assert.isTrue(result, 'Should be true for toIsNew and !fromIsLeaving');
      await capValidator.validate(10, 0, 1);
      const investorCount = await capValidator.investorCount.call();
      assert.equal(investorCount.toNumber(), preInvestorCount.toNumber() + 1);
    });

    it('it returns true when !toIsNew and !fromIsLeaving; not change investorCount', async () => {
      const preInvestorCount = await capValidator.investorCount.call();
      const result = await capValidator.validate.call(10, 10, 1);
      assert.isTrue(result, 'Should be true for !toIsNew and !fromIsLeaving');

      await capValidator.validate(10, 10, 1);
      const investorCount = await capValidator.investorCount.call();
      assert.equal(investorCount.toNumber(), preInvestorCount.toNumber());
    });

    it('it returns true when !toIsNew and fromIsLeaving; decrease investorCount', async () => {
      const preInvestorCount = await capValidator.investorCount.call();
      const result = await capValidator.validate.call(10, 10, 10);
      assert.isTrue(result, 'Should be true for !toIsNew and fromIsLeaving');

      await capValidator.validate(10, 10, 10);
      const investorCount = await capValidator.investorCount.call();
      assert.equal(investorCount.toNumber(), preInvestorCount.toNumber() - 1);
    });
  });
});
