const Web3 = require("web3");
const MemoryStorageParser = require("./contractDefinition.js");

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);

getStorageAt().then();

async function getStorageAt() {
  for (
    let i = 0;
    i <= MemoryStorageParser.antiSnipeContract.memorySlotsCount;
    i++
  ) {
    const values = await MemoryStorageParser.parseMemorySlot(
      MemoryStorageParser.antiSnipeContract,
      i
    );

    for (let value of values) {
      console.log(value);
    }
  }
}
