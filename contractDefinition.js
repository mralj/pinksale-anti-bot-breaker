var Web3 = require("web3");

let web3Instance;

exports.initWeb3 = (web3) => {
  if (web3Instance) {
    return;
  }

  if (!web3) {
    web3Instance = new Web3(
      new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
    );

    return;
  }

  web3Instance = web3;
};

exports.antiSnipeContract = {
  contractName: "AntiSnipe - SarabiChain",
  memorySlotsCount: 11,
  memorySlotDefinitions: [
    {
      name: "AntiSnipe Enabled",
      type: "struct",
      fields: [
        { name: "enabled", type: "bool" },
        { name: "tokenContractAddress", type: "address" },
      ],
    },
    {
      name: "LIQ Par Aaddress",
      type: "address",
    },
  ],
};

exports.parseMemorySlot = (contract, slotIndex, bytes) => {
  this.initWeb3();

  memorySlotDefinition = contract.memorySlotDefinitions[slotIndex];
  if (!memorySlotDefinition) {
    return null;
  }

  if (memorySlotDefinition.type == "struct") {
    return `STRUCT ${bytes}`;
  }
  return prettyPrintMemorySlot(memorySlotDefinition, bytes);
};

prettyPrintMemorySlot = (memorySlotDefinition, bytes) => {
  return `${memorySlotDefinition.name}: ${parseBytes(
    memorySlotDefinition.type,
    bytes
  )}`;
};

parseBytes = (type, bytes) => {
  switch (type) {
    case "bool":
      return web3Instance.toBool(bytes);
    case "address":
      return web3Instance.utils.toChecksumAddress(bytesAddressToAddress(bytes));
    default:
      return bytes;
  }
};

bytesAddressToAddress = (bytes) => {
  const lengthOf0x = 2;
  const argLength = 64;
  const totalLength = lengthOf0x + argLength;
  const addressLength = 40;

  if (bytes.length < totalLength) {
    throw new Error("Invalid address length");
  }

  return `0x${bytes.substring(totalLength - addressLength)}`;
};
