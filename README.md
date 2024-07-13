# Description

This is a small helper that reads the memory storage of PinkSale's anti-bot contract. 
We cannot just track transactions sent to this contract as default values are set (usually not changed by token deployers) upon contract creation.

This is likely outdated, by now, but at the time when launching $hitcoins on Pinksale was popular, my bot was one of the few (if not the only) that could buy tokens having Pinksale anti-bot protections.

The way I broke their protections, is by reading the decompiled EVM code of their anti-bot contract. After understanding how it works, I created this helper tool, where one can just paste an anti-bot contract (each token has its own anti-bot contract - same code, it's just deployed per token basis) and get the relevant info.

The way this Pinksale protection works (worked?) is as follows:
  1. Protections are OFF after N blocks
  2. If you are buying in [0, N] blocks, you are maybe bot
  3. If you try to transfer tokens multiple times in the same block (during those first N blocks), you are definitively bot
  4. If you buy in [0, N] blocks, and sell/transfer after block N, you are a bot

The aforementioned N was by default 2, so what one could do is 
  1. Buy in block 0
  2. Sell everything (or transfer for later sell) in blocks 1 or 2 

Given that you can only do this by having a bot  (albeit a really fast one), it bit ironic to call this an anti-bot measure.

## Token example
Here is the  token that uses these protections: 

https://bscscan.com/address/0xa3f37c4fb0c5c4cdb55b5b3adf0a40529f908228

This TX sets the anti-bot contract:

https://bscscan.com/tx/0x6e5e0a5fbbc8c41811ddcc525b85c2469dcaa67ffec5a10a7b01a5dd0783fd9f

And the relevant call for sniper check is in the `finalizeTransfer` method used by token. 

Enable trading call: https://bscscan.com/tx/0xc3f23e782f3a97702a62f3277e0f2ac3b1c68e7dafcfb14579ce9e56116c7f42

Here is my successful buy and transfer to the selling account:
https://bscscan.com/token/0xa3f37c4fb0c5c4cdb55b5b3adf0a40529f908228?a=0x44f7f6773b6889c9ac013ad63bf2d84a9346387b

As you can see buy happened in the 0th block. 

## Anti-bot Smart contract analysis 
For the most important part search for: `ecd07a53`
In the code below there are my thoughts on how most relevant parts work and what's what. 

```SOL
# Palkeoramix decompiler. 

const 17e1adc1 = 180
const 7dafe0d7 = 2

def storage:
  stor0 is uint8 at storage 0 // enabled boolean
  tokenContractAddress is addr at storage 0 offset 8
  stor0 is uint256 at storage 0 offset 8

  1c837ba9Address is addr at storage 1

  stor2 is mapping of uint8 at storage 2


  1c8aeb0c is uint8 at storage 3 // anti snipe enabled
  bd111e67 is uint8 at storage 3 offset 8 // anti block enabled
  bffb691d is uint8 at storage 3 offset 16 // blackilist enabled
  stor3 is uint256 at storage 3 offset 16
  stor3 is uint256 at storage 3 offset 8

  stor4 is mapping of uint8 at storage 4 // sniprs
  stor5 is mapping of uint8 at storage 5 //blacklist
  stor6 is mapping of uint8 at storage 6
  2d67d73f is uint8 at storage 7

  stor8 is uint8 at storage 8 // block_offset
  stor8 is uint32 at storage 8
  stor8 is uint32 at storage 8 offset 24 // block no.
  stor8 is uint64 at storage 8 offset 56 //  timestamp


  stor9 is mapping of uint256 at storage 9

  6ea83aeb is uint8 at storage 10
  decimals is uint8 at storage 10 offset 8

  55dbc369 is uint256 at storage 11 // snimper counter

def 1c837ba9(): # not payable
  return 1c837ba9Address

def 1c8aeb0c(): # not payable
  return bool(1c8aeb0c)

def 2d67d73f(): # not payable
  return bool(2d67d73f)

def decimals(): # not payable
  return decimals

def tokenContract(): # not payable
  return tokenContractAddress

def 55dbc369(): # not payable
  return 55dbc369

def 6ea83aeb(): # not payable
  return bool(6ea83aeb)

def bd111e67(): # not payable
  return bool(bd111e67)

def bffb691d(): # not payable
  return bool(bffb691d)

#
#  Regular functions
#


// get contract address
def df9117b8(): # not payable
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  return tokenContractAddress

// probalby enable/disable (not sure if this is enableTrading or enable anti-snipe check)
def 563485ab(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == bool(_param1)
  require 0x60808eaaed5afa68dc2d7b1b8b3eff84c846754d == caller
  uint8(stor0.field_0) = uint8(bool(_param1))

// check enabled
def dc7f0124(): # not payable
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  if uint8(stor0.field_0):
      return 1
  else:
      return 0


// i have no idea what this one does, but doesn't look important (famous last words) 
def sweep(): # not payable
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  call caller with:
     value eth.balance(this.address) wei
       gas 2300 * is_zero(value) wei
  if not ext_call.success:
      revert with ext_call.return_data[0 len return_data.size]

// not sure what this one is 
def 6fb57ed4(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  stor5[addr(_param1)] = 0

// not sure
def 01435832(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  return bool(stor6[addr(_param1)])

// is sinper
def 0f3a325f(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  return bool(stor4[addr(_param1)])

// dont' know
def 21e44230(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  return bool(stor5[addr(_param1)])


// don't know
def 3ba3d138(): # not payable
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  return uint8(stor8.field_0), uint8(stor8.field_0), uint8(stor8.field_0), uint32(stor8.field_0), uint64(stor8.field_56)

// sets the token contract address
def 0803b57b(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  if not addr(_param1) - this.address:
      revert with 0, 'Can't be self.'
  tokenContractAddress = addr(_param1)

def 38cb04ed(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == addr(_param1)
  require _param2 == bool(_param2)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  stor6[addr(_param1)] = uint8(bool(_param2))

// set LP pair
def 80c581d1(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == addr(_param1)
  require _param2 == bool(_param2)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  stor2[addr(_param1)] = uint8(bool(_param2))

// set protecitons
def efbdbabd(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == bool(_param1)
  require _param2 == bool(_param2)
  if chainid != 97:
      if chainid != 4:
          if chainid != 3:
              require caller == tokenContractAddress
  1c8aeb0c = uint8(bool(_param1))
  Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
  Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16

// looks maybe like edit protections?
// it the same as set protections but also token owner can set the protections
def 14d22d4f(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == bool(_param1)
  require _param2 == bool(_param2)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  1c8aeb0c = uint8(bool(_param1))
  Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
  Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16

// remove sniper
def 33251a0b(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'

  if not stor4[addr(_param1)]:
      revert with 0, 'Account is not a logged sniper.'
  if stor4[addr(_param1)]: stor4[addr(_param1)] = 0
      if not 55dbc369:
          revert with 'NH{q', 17
      55dbc369--

// looks like remove sniper but also token owner can call
def 857e8a24(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
      if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
          if tokenContractAddress != caller:
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                  revert with 0, 'ERR: OW'
  if not stor4[addr(_param1)]:
      revert with 0, 'Account is not a logged sniper.'
  if stor4[addr(_param1)]:
      stor4[addr(_param1)] = 0
      if not 55dbc369:
          revert with 'NH{q', 17
      55dbc369--

// this one is setlaunch
def 6c115c34(uint256 _param1, uint256 _param2, uint256 _param3, uint256 _param4): # not payable
  require calldata.size - 4 >=′ 128
  require _param1 == addr(_param1) //liq pair
  require _param2 == uint32(_param2) // block
  require _param3 == uint64(_param3)
  require _param4 == uint8(_param4)
  // only owner
  // b97 is the address of the owner of the token (in this case carbon)
  // so the token owner or the token can callt this one  
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  // LIQ must have been added (the finalize must have been called)
  // not sure how this contract knows this as I cannot see in the caller (token) any calls
  // which would set this
  if uint32(stor8.token_launched_at_block_no):
      revert with 0, 'Cannot change after liquidity.'
  // we can end up here if the token owner calls this contract
  // but somehow the token address is not set  
  // as far as I can see stor0 is some kind of struct
  // field_8  is I guess because we have offset 8 bytes for uint8 which is the first thin at the storage0
  if not tokenContractAddress:
      // atm I have no idea what's this
      Mask(248, 0, stor0.field_8) = Mask(248, 0, caller)
  1c837ba9Address = addr(_param1)
  stor2[addr(_param1)] = 1 // this is map of address (which is LIQ pair address), not sure if 1 is number one or true

  uint32(stor8.token_launched_at_block_no) = uint32(_param2) // block number
  uint64(stor8.field_56) = uint64(_param3) // block timestamp

  2d67d73f = 1

  decimals = uint8(_param4) // param4 is also decimals

// this is bot check function
def ecd07a53(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 96
  require _param1 == addr(_param1) // this is from
  require _param2 == addr(_param2) // this is to
  // in case of buy from is LIQ_PAIR_ADDRESS and TO is buyer (bot)
  // in case of sell it's vice versa

  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'

  if not uint8(stor0.field_0):
      return 0 // I have to check this one, it looks like some flag, could be  tradingEnabled
  if bffb691d:
      if stor5[addr(_param1)]: // my guess is that stor5 is set of the addresses which are considered bots
          return 0
      if stor5[addr(_param2)]:
          return 0

  // looks like this function has 2 modes, will have to inspect what this flag is
  // it think it could be from the call:        antiSnipe.setProtections(_antiSnipe, _antiBlock);
  if 1c8aeb0c: // if antisnipe enabled
      // I think this is some weird safety check becacuse this can also be writtern as if -sale_enabled_Block > 0 and this can never be true (unless this is initialized at eg. -1)
      // my guess this is smth. from "safe math" which checks for overflows
      if block.number - uint32(stor8.token_launched_at_block_no) > block.number:
          revert with 'NH{q', 17
// ---------------------------------------------------------------------------------------------------
      if stor4[addr(_param1)]: // if _from_ is  sniper (this is sell)
            // eg. 2 < 97 - 95 will not enter the if, this means that you have to sell within `stor8.field_0` blocks, specifically you can sell in the
            // 1. same block as enabled trading (buy & sell) if block protections are not on
            // block + 1 after trading is enabled
            // block + 2 after trading is enabled
            // so if trading was enabled in block 95, valid blocks are 96, 97 (and 95 if no block protections)
           if uint8(stor8.field_0) < block.number - uint32(stor8.token_launched_at_block_no):
              return 0 // then bot
      else:
          if stor4[addr(_param2)]: // if _to_ is sniper (this is buy)
              if uint8(stor8.field_0) < block.number - uint32(stor8.token_launched_at_block_no):
                  return 0
          else:
              if stor4[tx.origin]:
                  if uint8(stor8.field_0) < block.number - uint32(stor8.token_launched_at_block_no):
                      return 0

// the section above can be read: if smth. is marked as sniper and they are doing TX in less than delta blocks since launch then they are bot
// at stor8.field_0 it is written how many blocks must pass between the launch and the buy/sell TX
// ---------------------------------------------------------------------------------------------------
              else:
                  if 2d67d73f: // this was set to true by setlaunch
                      if uint32(stor8.token_launched_at_block_no) > 0:
                          // if buy 
                          if stor2[addr(_param1)]:
                                  // delta > curreny_block - launch block
                                  // this means if we bougth too close to LIQ we are considered to be sniper
                                  // so if delta is 2, token launched at 95, the blocks which are not safe for buying are
                                  // 95 and 96
                              if uint8(stor8.field_0) > block.number - uint32(stor8.token_launched_at_block_no):
                                  stor4[tx.origin] = 1 // mark as bot
                                  // probably some safe math
                                  55dbc369++ // increase bot count
                                  if addr(_param2) != tx.origin:
                                      stor4[addr(_param2)] = 1 // mak as bot
                                      // more safe math
                                      55dbc369++ // increase bot count
// the code above won't immediatelly tell caller that someone is bot, but will mark one if buy is "too close" to launch  
// all other transfers which happen in delta < curreny_block - launch block will be marked as bot this is done in the block above this one
// -------------------------------------------------------------------------
  // if anti-block
  if bd111e67:
      // i think stor6 could be some whitelist so if the address is not whitelisted
      if not stor6[addr(_param1)] && not stor6[addr(_param2)]:
              if 56 == chainid: // if BSC
                  // this is some weird check, I think it's safe math
                  if uint32(stor8.token_launched_at_block_no) > uint32(stor8.token_launched_at_block_no) + 2:
                      revert with 'NH{q', 17 

                  // if TX is happening within the first two blocks
                  if block.number <= uint32(stor8.token_launched_at_block_no) + 2:
                      // I guess that stor9 ~ stor4, but in stor9 we track at which block ws TX made (latest block is tracked)
                      // this could be smth. like 
                      // if (stor9[tx.origin] == block_number)  {return 0 //bot} else {stor9[tx.origin] = block_number}
                      // is  just 0 falsehood or <= 0 is also falsehood?
                      if !(stor9[tx.origin] - block.number):
                          return 0 // bot
                      stor9[tx.origin] = block.number
                  else:
                      if 6ea83aeb:
                          if not stor9[tx.origin] - block.number:
                              return 0 //bot
                          stor9[tx.origin] = block.number
                      else:
                          bd111e67 = 0
                          6ea83aeb = 1

              // not intrested in this, as we are on the BSC 
              else:
                  if chainid != 97:
                      if not stor9[tx.origin] - block.number:
                          return 0
                      stor9[tx.origin] = block.number
                  else:
                      if uint32(stor8.token_launched_at_block_no) > uint32(stor8.field_24) + 2:
                          revert with 'NH{q', 17
                      if block.number <= uint32(stor8.token_launched_at_block_no) + 2:
                          if not stor9[tx.origin] - block.number:
                              return 0
                          stor9[tx.origin] = block.number
                      else:
                          if 6ea83aeb:
                              if not stor9[tx.origin] - block.number:
                                  return 0
                              stor9[tx.origin] = block.number
                          else:
                              bd111e67 = 0
                              6ea83aeb = 1
  return 1 // not bot

def _fallback() payable: # default function
  if calldata.size < 4:
      require not calldata.size
      stop
  if tokenContract() > uint32(call.func_hash) >> 224:
      if 568607280 > uint32(call.func_hash) >> 224:
          if 349318479 > uint32(call.func_hash) >> 224:
              if 21190706 == uint32(call.func_hash) >> 224:
                  require not call.value
                  require calldata.size - 4 >=′ 32
                  require _param1 == addr(_param1)
                  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                      if tokenContractAddress != caller:
                          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                              revert with 0, 'ERR: OW'
                  return bool(stor6[addr(_param1)])
              if uint32(call.func_hash) >> 224 != 134460795:
                  require 255472223 == uint32(call.func_hash) >> 224
                  require not call.value
                  require calldata.size - 4 >=′ 32
                  require _param1 == addr(_param1)
                  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                      if tokenContractAddress != caller:
                          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                              revert with 0, 'ERR: OW'
                  return bool(stor4[addr(_param1)])
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                  if tokenContractAddress != caller:
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                          revert with 0, 'ERR: OW'
              if not addr(_param1) - this.address:
                  revert with 0, 'Can't be self.'
              tokenContractAddress = addr(_param1)
          else:
              if uint32(call.func_hash) >> 224 != 349318479:
                  if 400666049 == uint32(call.func_hash) >> 224:
                      require not call.value
                      return 180
                  if 478378921 == uint32(call.func_hash) >> 224:
                      require not call.value
                      return 1c837ba9Address
                  require 478866188 == uint32(call.func_hash) >> 224
                  require not call.value
                  return bool(1c8aeb0c)
              require not call.value
              require calldata.size - 4 >=′ 64
              require _param1 == bool(_param1)
              require _param2 == bool(_param2)
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                  if tokenContractAddress != caller:
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                          revert with 0, 'ERR: OW'
              1c8aeb0c = uint8(bool(_param1))
              Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
              Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16
      else:
          if 858069515 > uint32(call.func_hash) >> 224:
              if uint32(call.func_hash) >> 224 != 568607280:
                  if 761780031 == uint32(call.func_hash) >> 224:
                      require not call.value
                      return bool(2d67d73f)
                  require decimals() == uint32(call.func_hash) >> 224
                  require not call.value
                  return decimals
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                  if tokenContractAddress != caller:
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                          revert with 0, 'ERR: OW'
              return bool(stor5[addr(_param1)])
          if uint32(call.func_hash) >> 224 != 858069515:
              if sweep() == uint32(call.func_hash) >> 224:
                  require not call.value
                  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                      if tokenContractAddress != caller:
                          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                              revert with 0, 'ERR: OW'
                  call caller with:
                     value eth.balance(this.address) wei
                       gas 2300 * is_zero(value) wei
                  if not ext_call.success:
                      revert with ext_call.return_data[0 len return_data.size]
              else:
                  if uint32(call.func_hash) >> 224 != 952829165:
                      require 1000591672 == uint32(call.func_hash) >> 224
                      require not call.value
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                          if tokenContractAddress != caller:
                              if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                                  revert with 0, 'ERR: OW'
                      return uint8(stor8.field_0), uint8(stor8.field_0), uint8(stor8.field_0), uint32(stor8.field_0), uint64(stor8.field_56)
                  require not call.value
                  require calldata.size - 4 >=′ 64
                  require _param1 == addr(_param1)
                  require _param2 == bool(_param2)
                  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                      if tokenContractAddress != caller:
                          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                              revert with 0, 'ERR: OW'
                  stor6[addr(_param1)] = uint8(bool(_param2))
          else:
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                  if tokenContractAddress != caller:
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                          revert with 0, 'ERR: OW'
              if not stor4[addr(_param1)]:
                  revert with 0, 'Account is not a logged sniper.'
              if stor4[addr(_param1)]:
                  stor4[addr(_param1)] = 0
                  if not 55dbc369:
                      revert with 'NH{q', 17
                  55dbc369--
      stop
  if 2160427473 > uint32(call.func_hash) >> 224:
      if 1813077044 > uint32(call.func_hash) >> 224:
          if tokenContract() == uint32(call.func_hash) >> 224:
              require not call.value
              return tokenContractAddress
          if 1440465769 == uint32(call.func_hash) >> 224:
              require not call.value
              return 55dbc369
          require 1446282667 == uint32(call.func_hash) >> 224
          require not call.value
          require calldata.size - 4 >=′ 32
          require _param1 == bool(_param1)
          require 0x60808eaaed5afa68dc2d7b1b8b3eff84c846754d == caller
          uint8(stor0.field_0) = uint8(bool(_param1))
      else:
          if uint32(call.func_hash) >> 224 != 1813077044:
              if 1856518891 == uint32(call.func_hash) >> 224:
                  require not call.value
                  return bool(6ea83aeb)
              if uint32(call.func_hash) >> 224 != 1874165460:
                  require 2108678359 == uint32(call.func_hash) >> 224
                  require not call.value
                  return 2
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                  if tokenContractAddress != caller:
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                          revert with 0, 'ERR: OW'
              stor5[addr(_param1)] = 0
          else:
              require not call.value
              require calldata.size - 4 >=′ 128
              require _param1 == addr(_param1)
              require _param2 == uint32(_param2)
              require _param3 == uint64(_param3)
              require _param4 == uint8(_param4)
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                  if tokenContractAddress != caller:
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                          revert with 0, 'ERR: OW'
              if uint32(stor8.token_launched_at_block_no):
                  revert with 0, 'Cannot change after liquidity.'
              if not tokenContractAddress:
                  Mask(248, 0, stor0.field_8) = Mask(248, 0, caller)
              1c837ba9Address = addr(_param1)
              stor2[addr(_param1)] = 1
              uint32(stor8.token_launched_at_block_no) = uint32(_param2)
              uint64(stor8.field_56) = uint64(_param3)
              2d67d73f = 1
              decimals = uint8(_param4)
      stop
  if 3699310884 > uint32(call.func_hash) >> 224:
      if 2160427473 == uint32(call.func_hash) >> 224:
          require not call.value
          require calldata.size - 4 >=′ 64
          require _param1 == addr(_param1)
          require _param2 == bool(_param2)
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
              if tokenContractAddress != caller:
                  if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                      revert with 0, 'ERR: OW'
          stor2[addr(_param1)] = uint8(bool(_param2))
      else:
          if uint32(call.func_hash) >> 224 != 2239662628:
              if 3172015719 == uint32(call.func_hash) >> 224:
                  require not call.value
                  return bool(bd111e67)
              require 3220924701 == uint32(call.func_hash) >> 224
              require not call.value
              return bool(bffb691d)
          require not call.value
          require calldata.size - 4 >=′ 32
          require _param1 == addr(_param1)
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
              if tokenContractAddress != caller:
                  if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                      revert with 0, 'ERR: OW'
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
                  if tokenContractAddress != caller:
                      if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                          revert with 0, 'ERR: OW'
          if not stor4[addr(_param1)]:
              revert with 0, 'Account is not a logged sniper.'
          if stor4[addr(_param1)]:
              stor4[addr(_param1)] = 0
              if not 55dbc369:
                  revert with 'NH{q', 17
              55dbc369--
      stop
  if 3699310884 == uint32(call.func_hash) >> 224:
      require not call.value
      if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
          if tokenContractAddress != caller:
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                  revert with 0, 'ERR: OW'
      if uint8(stor0.field_0):
          return 1
      else:
          return 0
  if 3750827960 == uint32(call.func_hash) >> 224:
      require not call.value
      if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
          if tokenContractAddress != caller:
              if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
                  revert with 0, 'ERR: OW'
      return tokenContractAddress
  if uint32(call.func_hash) >> 224 != 3973085779:
      require 4022188733 == uint32(call.func_hash) >> 224
      require not call.value
      require calldata.size - 4 >=′ 64
      require _param1 == bool(_param1)
      require _param2 == bool(_param2)
      if chainid != 97:
          if chainid != 4:
              if chainid != 3:
                  require caller == tokenContractAddress
      1c8aeb0c = uint8(bool(_param1))
      Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
      Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16
      stop
  require not call.value
  require calldata.size - 4 >=′ 96
  require _param1 == addr(_param1)
  require _param2 == addr(_param2)
  if 0xb97234b783a28e52567eee47164d29a292e42ebf != caller:
      if tokenContractAddress != caller:
          if 0xb97234b783a28e52567eee47164d29a292e42ebf != tx.origin:
              revert with 0, 'ERR: OW'
  if not uint8(stor0.field_0):
      return 0
  if bffb691d:
      if stor5[addr(_param1)]:
          return 0
      if stor5[addr(_param2)]:
          return 0
  if 1c8aeb0c: 
      if block.number - uint32(stor8.token_launched_at_block_no) > block.number:
          revert with 'NH{q', 17
      if stor4[addr(_param1)]:
          if uint8(stor8.field_0) < block.number - uint32(stor8.token_launched_at_block_no):
              return 0
      else:
          if stor4[addr(_param2)]:
              if uint8(stor8.field_0) < block.number - uint32(stor8.token_launched_at_block_no):
                  return 0
          else:
              if stor4[tx.origin]:
                  if uint8(stor8.field_0) < block.number - uint32(stor8.token_launched_at_block_no):
                      return 0
              else:
                  if 2d67d73f:
                      if uint32(stor8.token_launched_at_block_no) > 0:
                          if stor2[addr(_param1)]:
                              if uint8(stor8.field_0) > block.number - uint32(stor8.token_launched_at_block_no):
                                  stor4[tx.origin] = 1
                                  if not 55dbc369 - 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff:
                                      revert with 'NH{q', 17
                                  55dbc369++
                                  if addr(_param2) != tx.origin:
                                      stor4[addr(_param2)] = 1
                                      if not 55dbc369 - 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff:
                                          revert with 'NH{q', 17
                                      55dbc369++
  if bd111e67:
      if not stor6[addr(_param1)]:
          if not stor6[addr(_param2)]:
              if 56 == chainid:
                  if uint32(stor8.token_launched_at_block_no) > uint32(stor8.field_24) + 2:
                      revert with 'NH{q', 17
                  if block.number <= uint32(stor8.token_launched_at_block_no) + 2:
                      if not stor9[tx.origin] - block.number:
                          return 0
                      stor9[tx.origin] = block.number
                  else:
                      if 6ea83aeb:
                          if not stor9[tx.origin] - block.number:
                              return 0
                          stor9[tx.origin] = block.number
                      else:
                          bd111e67 = 0
                          6ea83aeb = 1
              else:
                  if chainid != 97:
                      if not stor9[tx.origin] - block.number:
                          return 0
                      stor9[tx.origin] = block.number
                  else:
                      if uint32(stor8.token_launched_at_block_no) > uint32(stor8.field_24) + 2:
                          revert with 'NH{q', 17
                      if block.number <= uint32(stor8.token_launched_at_block_no) + 2:
                          if not stor9[tx.origin] - block.number:
                              return 0
                          stor9[tx.origin] = block.number
                      else:
                          if 6ea83aeb:
                              if not stor9[tx.origin] - block.number:
                                  return 0
                              stor9[tx.origin] = block.number
                          else:
                              bd111e67 = 0
                              6ea83aeb = 1
  return 1



```

# Non commented code for easier comparison

```
const unknown17e1adc1 = 180
const unknown7dafe0d7 = 2

def storage:
  stor0 is uint8 at storage 0
  tokenContractAddress is addr at storage 0 offset 8
  stor0 is uint256 at storage 0 offset 8
  unknown1c837ba9Address is addr at storage 1
  stor2 is mapping of uint8 at storage 2
  unknown1c8aeb0c is uint8 at storage 3
  unknownbd111e67 is uint8 at storage 3 offset 8
  unknownbffb691d is uint8 at storage 3 offset 16
  stor3 is uint256 at storage 3 offset 16
  stor3 is uint256 at storage 3 offset 8
  stor4 is mapping of uint8 at storage 4
  stor5 is mapping of uint8 at storage 5
  stor6 is mapping of uint8 at storage 6
  unknown2d67d73f is uint8 at storage 7
  stor8 is uint8 at storage 8
  stor8 is uint32 at storage 8
  stor8 is uint32 at storage 8 offset 24
  stor8 is uint64 at storage 8 offset 56
  stor9 is mapping of uint256 at storage 9
  unknown6ea83aeb is uint8 at storage 10
  decimals is uint8 at storage 10 offset 8
  unknown55dbc369 is uint256 at storage 11
  unknown0758d924Address is addr at storage 12

def unknown0758d924(): # not payable
  return unknown0758d924Address

def unknown1c837ba9(): # not payable
  return unknown1c837ba9Address

def unknown1c8aeb0c(): # not payable
  return bool(unknown1c8aeb0c)

def unknown2d67d73f(): # not payable
  return bool(unknown2d67d73f)

def decimals(): # not payable
  return decimals

def tokenContract(): # not payable
  return tokenContractAddress

def unknown55dbc369(): # not payable
  return unknown55dbc369

def unknown6ea83aeb(): # not payable
  return bool(unknown6ea83aeb)

def unknownbd111e67(): # not payable
  return bool(unknownbd111e67)

def unknownbffb691d(): # not payable
  return bool(unknownbffb691d)

#
#  Regular functions
#

def unknowndf9117b8(): # not payable
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  return tokenContractAddress

def unknown563485ab(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == bool(_param1)
  require 0x60808eaaed5afa68dc2d7b1b8b3eff84c846754d == caller
  uint8(stor0.field_0) = uint8(bool(_param1))

def unknowndc7f0124(): # not payable
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  if uint8(stor0.field_0):
      return 1
  else:
      return 0

def sweep(): # not payable
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  call caller with:
     value eth.balance(this.address) wei
       gas 2300 * is_zero(value) wei
  if not ext_call.success:
      revert with ext_call.return_data[0 len return_data.size]

def unknown6fb57ed4(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  stor5[addr(_param1)] = 0

def unknown01435832(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  return bool(stor6[addr(_param1)])

def unknown0f3a325f(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  return bool(stor4[addr(_param1)])

def unknown21e44230(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  return bool(stor5[addr(_param1)])

def unknown3ba3d138(): # not payable
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  return uint8(stor8.field_0), uint8(stor8.field_0), uint8(stor8.field_0), uint32(stor8.field_0), uint64(stor8.field_56)

def unknown0803b57b(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  if not addr(_param1) - this.address:
      revert with 0, 'Can't be self.'
  tokenContractAddress = addr(_param1)

def unknown38cb04ed(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == addr(_param1)
  require _param2 == bool(_param2)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  stor6[addr(_param1)] = uint8(bool(_param2))

def unknown80c581d1(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == addr(_param1)
  require _param2 == bool(_param2)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  stor2[addr(_param1)] = uint8(bool(_param2))

def unknownefbdbabd(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == bool(_param1)
  require _param2 == bool(_param2)
  if chainid != 97:
      if chainid != 4:
          if chainid != 3:
              require caller == tokenContractAddress
  unknown1c8aeb0c = uint8(bool(_param1))
  Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
  Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16

def unknown14d22d4f(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 64
  require _param1 == bool(_param1)
  require _param2 == bool(_param2)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  unknown1c8aeb0c = uint8(bool(_param1))
  Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
  Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16

def unknown33251a0b(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  if not stor4[addr(_param1)]:
      revert with 0, 'Account is not a logged sniper.'
  if stor4[addr(_param1)]:
      stor4[addr(_param1)] = 0
      if not unknown55dbc369:
          revert with 0, 17
      unknown55dbc369--

def unknown857e8a24(uint256 _param1): # not payable
  require calldata.size - 4 >=′ 32
  require _param1 == addr(_param1)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
          if tokenContractAddress != caller:
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                  revert with 0, 'ERR: OW'
  if not stor4[addr(_param1)]:
      revert with 0, 'Account is not a logged sniper.'
  if stor4[addr(_param1)]:
      stor4[addr(_param1)] = 0
      if not unknown55dbc369:
          revert with 0, 17
      unknown55dbc369--

def unknown6c115c34(uint256 _param1, uint256 _param2, uint256 _param3, uint256 _param4): # not payable
  require calldata.size - 4 >=′ 128
  require _param1 == addr(_param1)
  require _param2 == uint32(_param2)
  require _param3 == uint64(_param3)
  require _param4 == uint8(_param4)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  if uint32(stor8.field_24):
      revert with 0, 'Cannot change after liquidity.'
  if not tokenContractAddress:
      Mask(248, 0, stor0.field_8) = Mask(248, 0, caller)
  unknown1c837ba9Address = addr(_param1)
  stor2[addr(_param1)] = 1
  uint32(stor8.field_24) = uint32(_param2)
  uint64(stor8.field_56) = uint64(_param3)
  unknown2d67d73f = 1
  decimals = uint8(_param4)

def unknownecd07a53(uint256 _param1, uint256 _param2): # not payable
  require calldata.size - 4 >=′ 96
  require _param1 == addr(_param1)
  require _param2 == addr(_param2)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  if not uint8(stor0.field_0):
      return 0
  if unknownbffb691d:
      if stor5[addr(_param1)]:
          return 0
      if stor5[addr(_param2)]:
          return 0
  if unknown1c8aeb0c:
      if block.number - uint32(stor8.field_24) > block.number:
          revert with 0, 17
      if stor4[addr(_param1)]:
          if uint8(stor8.field_0) < block.number - uint32(stor8.field_24):
              return 0
      else:
          if stor4[addr(_param2)]:
              if uint8(stor8.field_0) < block.number - uint32(stor8.field_24):
                  return 0
          else:
              if stor4[tx.origin]:
                  if uint8(stor8.field_0) < block.number - uint32(stor8.field_24):
                      return 0
              else:
                  if unknown2d67d73f:
                      if uint32(stor8.field_24) > 0:
                          if stor2[addr(_param1)]:
                              if uint8(stor8.field_0) > block.number - uint32(stor8.field_24):
                                  stor4[tx.origin] = 1
                                  if not unknown55dbc369 + 1:
                                      revert with 0, 17
                                  unknown55dbc369++
                                  if addr(_param2) != tx.origin:
                                      stor4[addr(_param2)] = 1
                                      if not unknown55dbc369 + 1:
                                          revert with 0, 17
                                      unknown55dbc369++
  if unknownbd111e67:
      if not stor6[addr(_param1)]:
          if not stor6[addr(_param2)]:
              if 56 == chainid:
                  if uint32(stor8.field_24) > uint32(stor8.field_24) + 2:
                      revert with 0, 17
                  if block.number <= uint32(stor8.field_24) + 2:
                      if not stor9[tx.origin] - block.number:
                          return 0
                      stor9[tx.origin] = block.number
                  else:
                      if unknown6ea83aeb:
                          if not stor9[tx.origin] - block.number:
                              return 0
                          stor9[tx.origin] = block.number
                      else:
                          unknownbd111e67 = 0
                          unknown6ea83aeb = 1
              else:
                  if chainid != 97:
                      if not stor9[tx.origin] - block.number:
                          return 0
                      stor9[tx.origin] = block.number
                  else:
                      if uint32(stor8.field_24) > uint32(stor8.field_24) + 2:
                          revert with 0, 17
                      if block.number <= uint32(stor8.field_24) + 2:
                          if not stor9[tx.origin] - block.number:
                              return 0
                          stor9[tx.origin] = block.number
                      else:
                          if unknown6ea83aeb:
                              if not stor9[tx.origin] - block.number:
                                  return 0
                              stor9[tx.origin] = block.number
                          else:
                              unknownbd111e67 = 0
                              unknown6ea83aeb = 1
  return 1

def _fallback() payable: # default function
  if calldata.size < 4:
      require not calldata.size
      stop
  if tokenContract() > uint32(call.func_hash) >> 224:
      if 478866188 > uint32(call.func_hash) >> 224:
          if 255472223 > uint32(call.func_hash) >> 224:
              if 21190706 == uint32(call.func_hash) >> 224:
                  require not call.value
                  require calldata.size - 4 >=′ 32
                  require _param1 == addr(_param1)
                  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                      if tokenContractAddress != caller:
                          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                              revert with 0, 'ERR: OW'
                  return bool(stor6[addr(_param1)])
              if 123263268 == uint32(call.func_hash) >> 224:
                  require not call.value
                  return unknown0758d924Address
              require 134460795 == uint32(call.func_hash) >> 224
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                  if tokenContractAddress != caller:
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                          revert with 0, 'ERR: OW'
              if not addr(_param1) - this.address:
                  revert with 0, 'Can't be self.'
              tokenContractAddress = addr(_param1)
          else:
              if 255472223 == uint32(call.func_hash) >> 224:
                  require not call.value
                  require calldata.size - 4 >=′ 32
                  require _param1 == addr(_param1)
                  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                      if tokenContractAddress != caller:
                          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                              revert with 0, 'ERR: OW'
                  return bool(stor4[addr(_param1)])
              if uint32(call.func_hash) >> 224 != 349318479:
                  if 400666049 == uint32(call.func_hash) >> 224:
                      require not call.value
                      return 180
                  require 478378921 == uint32(call.func_hash) >> 224
                  require not call.value
                  return unknown1c837ba9Address
              require not call.value
              require calldata.size - 4 >=′ 64
              require _param1 == bool(_param1)
              require _param2 == bool(_param2)
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                  if tokenContractAddress != caller:
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                          revert with 0, 'ERR: OW'
              unknown1c8aeb0c = uint8(bool(_param1))
              Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
              Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16
      else:
          if 858069515 > uint32(call.func_hash) >> 224:
              if 478866188 == uint32(call.func_hash) >> 224:
                  require not call.value
                  return bool(unknown1c8aeb0c)
              if uint32(call.func_hash) >> 224 != 568607280:
                  if 761780031 == uint32(call.func_hash) >> 224:
                      require not call.value
                      return bool(unknown2d67d73f)
                  require decimals() == uint32(call.func_hash) >> 224
                  require not call.value
                  return decimals
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                  if tokenContractAddress != caller:
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                          revert with 0, 'ERR: OW'
              return bool(stor5[addr(_param1)])
          if uint32(call.func_hash) >> 224 != 858069515:
              if sweep() == uint32(call.func_hash) >> 224:
                  require not call.value
                  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                      if tokenContractAddress != caller:
                          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                              revert with 0, 'ERR: OW'
                  call caller with:
                     value eth.balance(this.address) wei
                       gas 2300 * is_zero(value) wei
                  if not ext_call.success:
                      revert with ext_call.return_data[0 len return_data.size]
              else:
                  if uint32(call.func_hash) >> 224 != 952829165:
                      require 1000591672 == uint32(call.func_hash) >> 224
                      require not call.value
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                          if tokenContractAddress != caller:
                              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                                  revert with 0, 'ERR: OW'
                      return uint8(stor8.field_0), uint8(stor8.field_0), uint8(stor8.field_0), uint32(stor8.field_0), uint64(stor8.field_56)
                  require not call.value
                  require calldata.size - 4 >=′ 64
                  require _param1 == addr(_param1)
                  require _param2 == bool(_param2)
                  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                      if tokenContractAddress != caller:
                          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                              revert with 0, 'ERR: OW'
                  stor6[addr(_param1)] = uint8(bool(_param2))
          else:
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                  if tokenContractAddress != caller:
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                          revert with 0, 'ERR: OW'
              if not stor4[addr(_param1)]:
                  revert with 0, 'Account is not a logged sniper.'
              if stor4[addr(_param1)]:
                  stor4[addr(_param1)] = 0
                  if not unknown55dbc369:
                      revert with 0, 17
                  unknown55dbc369--
      stop
  if 2160427473 > uint32(call.func_hash) >> 224:
      if 1813077044 > uint32(call.func_hash) >> 224:
          if tokenContract() == uint32(call.func_hash) >> 224:
              require not call.value
              return tokenContractAddress
          if 1440465769 == uint32(call.func_hash) >> 224:
              require not call.value
              return unknown55dbc369
          require 1446282667 == uint32(call.func_hash) >> 224
          require not call.value
          require calldata.size - 4 >=′ 32
          require _param1 == bool(_param1)
          require 0x60808eaaed5afa68dc2d7b1b8b3eff84c846754d == caller
          uint8(stor0.field_0) = uint8(bool(_param1))
      else:
          if uint32(call.func_hash) >> 224 != 1813077044:
              if 1856518891 == uint32(call.func_hash) >> 224:
                  require not call.value
                  return bool(unknown6ea83aeb)
              if uint32(call.func_hash) >> 224 != 1874165460:
                  require 2108678359 == uint32(call.func_hash) >> 224
                  require not call.value
                  return 2
              require not call.value
              require calldata.size - 4 >=′ 32
              require _param1 == addr(_param1)
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                  if tokenContractAddress != caller:
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                          revert with 0, 'ERR: OW'
              stor5[addr(_param1)] = 0
          else:
              require not call.value
              require calldata.size - 4 >=′ 128
              require _param1 == addr(_param1)
              require _param2 == uint32(_param2)
              require _param3 == uint64(_param3)
              require _param4 == uint8(_param4)
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                  if tokenContractAddress != caller:
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                          revert with 0, 'ERR: OW'
              if uint32(stor8.field_24):
                  revert with 0, 'Cannot change after liquidity.'
              if not tokenContractAddress:
                  Mask(248, 0, stor0.field_8) = Mask(248, 0, caller)
              unknown1c837ba9Address = addr(_param1)
              stor2[addr(_param1)] = 1
              uint32(stor8.field_24) = uint32(_param2)
              uint64(stor8.field_56) = uint64(_param3)
              unknown2d67d73f = 1
              decimals = uint8(_param4)
      stop
  if 3699310884 > uint32(call.func_hash) >> 224:
      if 2160427473 == uint32(call.func_hash) >> 224:
          require not call.value
          require calldata.size - 4 >=′ 64
          require _param1 == addr(_param1)
          require _param2 == bool(_param2)
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
              if tokenContractAddress != caller:
                  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                      revert with 0, 'ERR: OW'
          stor2[addr(_param1)] = uint8(bool(_param2))
      else:
          if uint32(call.func_hash) >> 224 != 2239662628:
              if 3172015719 == uint32(call.func_hash) >> 224:
                  require not call.value
                  return bool(unknownbd111e67)
              require 3220924701 == uint32(call.func_hash) >> 224
              require not call.value
              return bool(unknownbffb691d)
          require not call.value
          require calldata.size - 4 >=′ 32
          require _param1 == addr(_param1)
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
              if tokenContractAddress != caller:
                  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                      revert with 0, 'ERR: OW'
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
                  if tokenContractAddress != caller:
                      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                          revert with 0, 'ERR: OW'
          if not stor4[addr(_param1)]:
              revert with 0, 'Account is not a logged sniper.'
          if stor4[addr(_param1)]:
              stor4[addr(_param1)] = 0
              if not unknown55dbc369:
                  revert with 0, 17
              unknown55dbc369--
      stop
  if 3699310884 == uint32(call.func_hash) >> 224:
      require not call.value
      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
          if tokenContractAddress != caller:
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                  revert with 0, 'ERR: OW'
      if uint8(stor0.field_0):
          return 1
      else:
          return 0
  if 3750827960 == uint32(call.func_hash) >> 224:
      require not call.value
      if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
          if tokenContractAddress != caller:
              if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
                  revert with 0, 'ERR: OW'
      return tokenContractAddress
  if uint32(call.func_hash) >> 224 != 3973085779:
      require 4022188733 == uint32(call.func_hash) >> 224
      require not call.value
      require calldata.size - 4 >=′ 64
      require _param1 == bool(_param1)
      require _param2 == bool(_param2)
      if chainid != 97:
          if chainid != 4:
              if chainid != 3:
                  require caller == tokenContractAddress
      unknown1c8aeb0c = uint8(bool(_param1))
      Mask(248, 0, stor3.field_8) = Mask(248, 0, bool(_param2))
      Mask(240, 0, stor3.field_16) = Mask(240, 16, bool(_param1)) >> 16
      stop
  require not call.value
  require calldata.size - 4 >=′ 96
  require _param1 == addr(_param1)
  require _param2 == addr(_param2)
  if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != caller:
      if tokenContractAddress != caller:
          if 0x3d18b5df9aaee8c119f6b225002ec1da9ecccc06 != tx.origin:
              revert with 0, 'ERR: OW'
  if not uint8(stor0.field_0):
      return 0
  if unknownbffb691d:
      if stor5[addr(_param1)]:
          return 0
      if stor5[addr(_param2)]:
          return 0
  if unknown1c8aeb0c:
      if block.number - uint32(stor8.field_24) > block.number:
          revert with 0, 17
      if stor4[addr(_param1)]:
          if uint8(stor8.field_0) < block.number - uint32(stor8.field_24):
              return 0
      else:
          if stor4[addr(_param2)]:
              if uint8(stor8.field_0) < block.number - uint32(stor8.field_24):
                  return 0
          else:
              if stor4[tx.origin]:
                  if uint8(stor8.field_0) < block.number - uint32(stor8.field_24):
                      return 0
              else:
                  if unknown2d67d73f:
                      if uint32(stor8.field_24) > 0:
                          if stor2[addr(_param1)]:
                              if uint8(stor8.field_0) > block.number - uint32(stor8.field_24):
                                  stor4[tx.origin] = 1
                                  if not unknown55dbc369 + 1:
                                      revert with 0, 17
                                  unknown55dbc369++
                                  if addr(_param2) != tx.origin:
                                      stor4[addr(_param2)] = 1
                                      if not unknown55dbc369 + 1:
                                          revert with 0, 17
                                      unknown55dbc369++
  if unknownbd111e67:
      if not stor6[addr(_param1)]:
          if not stor6[addr(_param2)]:
              if 56 == chainid:
                  if uint32(stor8.field_24) > uint32(stor8.field_24) + 2:
                      revert with 0, 17
                  if block.number <= uint32(stor8.field_24) + 2:
                      if not stor9[tx.origin] - block.number:
                          return 0
                      stor9[tx.origin] = block.number
                  else:
                      if unknown6ea83aeb:
                          if not stor9[tx.origin] - block.number:
                              return 0
                          stor9[tx.origin] = block.number
                      else:
                          unknownbd111e67 = 0
                          unknown6ea83aeb = 1
              else:
                  if chainid != 97:
                      if not stor9[tx.origin] - block.number:
                          return 0
                      stor9[tx.origin] = block.number
                  else:
                      if uint32(stor8.field_24) > uint32(stor8.field_24) + 2:
                          revert with 0, 17
                      if block.number <= uint32(stor8.field_24) + 2:
                          if not stor9[tx.origin] - block.number:
                              return 0
                          stor9[tx.origin] = block.number
                      else:
                          if unknown6ea83aeb:
                              if not stor9[tx.origin] - block.number:
                                  return 0
                              stor9[tx.origin] = block.number
                          else:
                              unknownbd111e67 = 0
                              unknown6ea83aeb = 1
  return 1
```

