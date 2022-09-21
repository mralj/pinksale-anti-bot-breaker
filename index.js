const Web3 = require("web3");
const MemoryStorageParser = require("./contractDefinition.js");

const web3Instance = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
);

const countOfStorageSlotsContactHas = 1;
const contractAddress = "0x0c11c871d1d5091A43778B759E247041E6f08e9A";

getStorageAt().then();

async function getStorageAt() {
  for (let i = 0; i <= countOfStorageSlotsContactHas; i++) {
    let slot = await web3Instance.eth.getStorageAt(contractAddress, i);
    console.log(
      `${MemoryStorageParser.parseMemorySlot(
        MemoryStorageParser.antiSnipeContract,
        i,
        slot
      )}`
    );
  }
}
