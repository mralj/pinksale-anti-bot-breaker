const Web3 = require("web3");
const BigNumber = require("bignumber.js");
let web3;

exports.initWeb3 = (web3Instance) => {
  if (web3) {
    return;
  }

  if (!web3Instance) {
    web3 = new Web3(
      new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/")
    );

    return;
  }

  web3 = web3Instance;
};

exports.antiSnipeContract = {
  contractName: "AntiSnipe - SarabiChain",
  contractAddress: "0x0c11c871d1d5091A43778B759E247041E6f08e9A",
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
    { type: "map" },
    {
      name: "AntiSnipe Config",
      type: "struct",
      fields: [
        { name: "anti snipe enabled", type: "bool" },
        { name: "anti block enabled", type: "bool" },
        { name: "blacklist enabled", type: "bool" },
      ],
    },
    { type: "map" },
    { type: "map" },
    { type: "map" },
    { name: "token launched", type: "bool" },
    {
      name: "Token Config",
      type: "struct",
      fields: [
        { name: "anti snipe enabled", type: "bool" },
        { name: "anti block enabled", type: "number" },
        { name: "blacklist enabled", type: "number" },
        { name: "blacklist enabled", type: "number" },
      ],
    },
  ],
};

exports.parseMemorySlot = async (contract, slotIndex) => {
  this.initWeb3();

  memorySlotDefinition = contract.memorySlotDefinitions[slotIndex];
  if (!memorySlotDefinition) {
    return null;
  }

  if (memorySlotDefinition.type === "map") {
    return ["Map is not supported yet"];
  }
  if (memorySlotDefinition.type == "struct") {
    return await parseStruct(
      contract.contractAddress,
      memorySlotDefinition.fields,
      slotIndex
    );
  }

  return [
    prettyPrintMemorySlot(
      memorySlotDefinition,
      await web3.eth.getStorageAt(contract.contractAddress, slotIndex)
    ),
  ];
};

parseStruct = async (contractAddress, structFields, slotIndex) => {
  const result = [];
  for (let i = 0; i < structFields.length; i++) {
    let slot = await web3.eth.getStorageAt(
      contractAddress,
      increaseHexByOne(slotIndex + i)
    );
    result.push(prettyPrintMemorySlot(structFields[i], slot));
  }

  return result;
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
      return web3.utils.hexToNumber(bytes) === 1;
    case "address":
      return web3.utils.toChecksumAddress(bytesAddressToAddress(bytes));
    case "number":
      return web3.utils.hexToNumber(bytes);
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

increaseHexByOne = (slotIndex) =>
  web3.utils.sha3(web3.utils.padLeft(`${slotIndex}`, 64), {
    encoding: "hex",
  });
