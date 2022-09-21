const Web3 = require("web3");
const MemoryStorageParser = require("./contractDefinition.js");

const web3 = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);

const countOfStorageSlotsContactHas = 8;

// web3.eth
//   .sendTransaction(
//     {
//       from: "0xc3e78770889a0160D2212e52C41aA9Fb935E4A96",
//       to: "0x0c11c871d1d5091A43778B759E247041E6f08e9A",
//       value: "1000000000000000000",
//       data: "0x2d67d73f",
//     },
//     function (err, transactionHash) {
//       if (!err) console.log(transactionHash + " success");
//     }
//   )
//   .then();

getStorageAt().then();

async function getStorageAt() {
  for (let i = 0; i <= countOfStorageSlotsContactHas; i++) {
    const values = await MemoryStorageParser.parseMemorySlot(
      MemoryStorageParser.antiSnipeContract,
      i
    );

    for (let value of values) {
      console.log(value);
    }
  }
}
