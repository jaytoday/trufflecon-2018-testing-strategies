const CapValidator = artifacts.require('CapValidator');
const SimpleToken = artifacts.require('SimpleToken');

module.exports = async function(deployer) {
  await deployer.deploy(CapValidator)
    .then(() => CapValidator.deployed())
    .then(() => deployer.deploy(SimpleToken, CapValidator.address));
};
