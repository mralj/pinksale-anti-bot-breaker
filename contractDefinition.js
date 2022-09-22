const Web3 = require("web3");
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
  contractAddress: "3975571f10ade161c9369651b105b4148cfbf8b9",
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
        { name: "blockoffset", type: "uint8" },
        { name: "?", type: "uint16" },
        { name: "block number", type: "uint32" },
        { name: "block timestamp", type: "uint64" },
      ],
    },
    { type: "map" },
    { name: "anti block finished", type: "bool" },
    { name: "bot count", type: "number" },
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
  let slot = await web3.eth.getStorageAt(contractAddress, slotIndex);

  let slot_i = 0;
  for (let i = 0; i < structFields.length; i++) {
    if (slot_i >= slot.length) {
      break;
    }
    result.push(
      prettyPrintMemorySlot(
        structFields[i],
        `0x${slot.substring(
          slot.length - slot_i - getStructFieldLen(structFields[i].type),
          slot.length - slot_i
        )}`
      )
    );
    slot_i += getStructFieldLen(structFields[i].type);
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
  if (type.startsWith("uint")) {
    type = "number";
  }
  switch (type) {
    case "bool":
      return web3.utils.hexToNumber(bytes) === 1;
    case "address":
      const addressBytes =
        bytes.length === 40 || bytes.length == 42
          ? bytes
          : bytesAddressToAddress(bytes);
      return web3.utils.toChecksumAddress(addressBytes);
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

getStructFieldLen = (type) => {
  if (type.startsWith("uint")) {
    uintType = parseInt(type.substring(4));
    return Math.ceil(uintType / 4);
  }
  switch (type) {
    case "bool":
      return 2;
    case "address":
      return 40;
    default:
      return 0;
  }
};
