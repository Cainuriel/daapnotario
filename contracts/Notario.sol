//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract Notario  {

  mapping (bytes32 => address) public records;
  mapping (bytes32 => uint256) public timestamps;

  address public notarizedAddress;

  event LogNotarized(bytes32 indexed record, address indexed notarizer, uint256 timestamp);

  constructor() {

    notarizedAddress = msg.sender;
  }

  function notarizeWithSign(bytes32 hash, bytes memory sig) public {
    require(hash != keccak256(abi.encodePacked("")), "hash vacio");
    require(records[hash] == address(0), "Documento ya notariado");
    require(notarizedAddress == msg.sender, "Usted no es el notario");
    require(notarizedAddress == recoverSigner(hash, sig), "Documento no firmado por el notario");
    records[hash] = msg.sender;
    timestamps[hash] = block.timestamp;

    emit LogNotarized(hash, msg.sender, block.timestamp);
  }

    function notarizeWithoutSign(bytes32 hash) public {
    require(hash != keccak256(abi.encodePacked("")), "hash vacio");
    require(records[hash] == address(0), "Documento ya notariado");
    require(notarizedAddress == msg.sender, "Usted no es el notario");
    records[hash] = msg.sender;
    timestamps[hash] = block.timestamp;

    emit LogNotarized(hash, msg.sender, block.timestamp);
  }

// comprueba si existe el documento
  function exists(bytes32 hash) external view returns (bool) {
    return records[hash] != address(0);
  }


// Comprueba si el notario ha notariado el documento
  function didNotarize(bytes32 hash) external view returns (bool) {
    return records[hash] == notarizedAddress;
  }


  function setNotarizedAddress(address _newAddress) external {
    notarizedAddress = _newAddress;
  }

  function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);

        return ecrecover(message, v, r, s);
    }

    /// signature methods.
    function splitSignature(bytes memory sig)
        internal
        pure
        returns (
            uint8 v,
            bytes32 r,
            bytes32 s
        )
    {
        require(sig.length == 65);

        assembly {
            // first 32 bytes, after the length prefix.
            r := mload(add(sig, 32))
            // second 32 bytes.
            s := mload(add(sig, 64))
            // final byte (first byte of the next 32 bytes).
            v := byte(0, mload(add(sig, 96)))
        }

        return (v, r, s);
    }

    /// builds a prefixed hash to mimic the behavior of eth_sign.
    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

// crea un hash recibiendo un string
   function creationHash(string memory data) public pure returns(bytes32) 
    {
        return keccak256(abi.encodePacked(data));
    }
}