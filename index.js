var Web3 = require('web3');

const web3Instance = new Web3(
  new Web3.providers.HttpProvider("https://bsc-dataseed.binance.org/"));

web3Instance.eth.getBalance("0x18Dd66457DF13f08dcf0809cE937aCd5e2d88156").then(console.log);
