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

// *** HELPFUL LINKS ***
// https://blockchain-academy.hs-mittweida.de/courses/solidity-coding-beginners-to-intermediate/lessons/solidity-12-reading-the-storage/topic/reading-the-ethereum-storage/
// https://coinsbench.com/solidity-layout-and-access-of-storage-variables-simply-explained-1ce964d7c738
// https://medium.com/@dariusdev/how-to-read-ethereum-contract-storage-44252c8af925
// https://mixbytes.io/blog/collisions-solidity-storage-layouts
