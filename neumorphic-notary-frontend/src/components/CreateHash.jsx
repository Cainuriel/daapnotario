import React, { useState, useEffect, use } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

// ABI for the Notario contract
const notarioABI = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "bytes32",
                "name": "record",
                "type": "bytes32"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "notarizer",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "timestamp",
                "type": "uint256"
            }
        ],
        "name": "LogNotarized",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "data",
                "type": "string"
            }
        ],
        "name": "creationHash",
        "outputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "stateMutability": "pure",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            }
        ],
        "name": "didNotarize",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            }
        ],
        "name": "exists",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            },
            {
                "internalType": "bytes",
                "name": "sig",
                "type": "bytes"
            }
        ],
        "name": "notarizeWithSign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "hash",
                "type": "bytes32"
            }
        ],
        "name": "notarizeWithoutSign",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "records",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "_newAddress",
                "type": "address"
            }
        ],
        "name": "setNotarizedAddress",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "bytes32",
                "name": "",
                "type": "bytes32"
            }
        ],
        "name": "timestamps",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

// TODO: Replace with your actual deployed contract address
const contractAddress = "0x52a485b2888fd9bb22a454a25130da103f0e0a43";

const CreateHashContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
`;

const HashDisplay = styled.div`
  margin-top: 15px;
  padding: 10px;
  border-radius: 5px;
  background-color: #e0e0e0;
  box-shadow: inset 3px 3px 6px #bebebe, inset -3px -3px 6px #ffffff;
  color: #333;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.9em;
  word-break: break-all;
  width: 90%;
  text-align: center;
`;

const ErrorMessage = styled(HashDisplay)`
  background-color: #ffdddd;
  color: #d8000c;
  font-family: 'Arial', sans-serif;
`;

const MotionHashDisplay = motion(HashDisplay);
const MotionErrorMessage = motion(ErrorMessage);



const StyledInput = styled(Input)`
  width: 80%; /* Make input take more width within the card */
`;

const CreateHash = () => {
  const [data, setData] = useState('hola amigo');
  const [generatedHash, setGeneratedHash] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);

  useEffect(() => {
    // Since creationHash is 'pure', we can use a generic provider if MetaMask is not available
    // or if we don't need a signer for this specific read-only operation.
    // For consistency, using BrowserProvider if window.ethereum exists.
    let provider;
    if (window.ethereum) {
      provider = new ethers.BrowserProvider(window.ethereum);
    } else {
      // Fallback to a public RPC if you want, or just allow interaction only when MetaMask is present.
      // For a 'pure' function, even a JsonRpcProvider without a signer would work.
      // provider = new ethers.JsonRpcProvider("YOUR_FALLBACK_RPC_URL");
      console.warn("MetaMask not detected. Using a read-only instance for hashing if possible, or contract interaction might fail.");
      // A pure function can be called without a provider/signer if you instantiate contract directly
      // but ethers.Contract typically expects a signerOrProvider.
      // If we don't have window.ethereum, we can still create a contract instance
      // that can call pure/view functions without needing to connect to a wallet.
      provider = ethers.getDefaultProvider(); //This will use default community shared key for basic calls.
                                              // Pure functions don't even need this.
    }
    
    // It's better to instantiate the contract without a signer for pure/view functions
    // if you don't want to force a wallet connection for these.
    // However, to keep it simple and ready for other types of interactions,
    // we can pass the provider. If a signer is needed later for other functions,
    // it would be: provider.getSigner().
    const notarioContract = new ethers.Contract(contractAddress, notarioABI, provider);
    setContract(notarioContract);

  }, []);

  const handleInputChange = (e) => {
    console.log("Input changed:", e.target.value);
    setData(e.target.value);
    setGeneratedHash(''); // Clear previous hash when input changes
    setError(''); // Clear previous error
  };

  const handleCreateHash = async () => {
    if (!data) {
      setError('Please enter data to hash.');
      return;
    }
    // if (!contract) {
    //   setError('Contract not initialized. Ensure MetaMask is connected or a fallback provider is available.');
    //   setIsLoading(false);
    //   return;
    // }
    console.log("Creating hash for data:", data);
    
    try {
      setError('');
      setIsLoading(true);
      console.log("loading", isLoading);
      
      // setGeneratedHash('Generating...'); // Replaced by isLoading
      const hash = await ethers.keccak256(ethers.toUtf8Bytes(data));
      console.log("Generated hash:", hash);
      setGeneratedHash(hash);
    } catch (err) {
      console.error("Error calling creationHash:", err);
      setError(`Error: ${err.message || 'Could not generate hash.'}`);
      setGeneratedHash('');
    } finally {
      setIsLoading(false);
      console.log("loading", isLoading);
      
    }
  };


  return (
    <Card>
      <CreateHashContainer>
        <h3>Generate Data Hash</h3>
        <StyledInput
          value={data}
          onChange={handleInputChange}
          placeholder="Enter data string"
        />
        <Button onClick={()=> handleCreateHash()} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : 'Create Hash'}
        </Button>
        <AnimatePresence>
          {generatedHash && !error && !isLoading && (
            <MotionHashDisplay
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <strong>Generated Hash:</strong> {generatedHash}
            </MotionHashDisplay>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {error && (
            <MotionErrorMessage
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {error}
            </MotionErrorMessage>
          )}
        </AnimatePresence>
      </CreateHashContainer>
    </Card>
  );
};

export default CreateHash;
