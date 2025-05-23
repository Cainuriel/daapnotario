import React, { useState, useEffect } from 'react';
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
const contractAddress = "0x52a485b2888fd9bb22a454a25130da103f0e0a43";

const VerifyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const StyledInput = styled(Input)`
  width: 90%;
`;

const ResultsDisplay = styled.div`
  margin-top: 15px;
  padding: 15px;
  border-radius: 10px;
  background-color: #e0e0e0;
  box-shadow: inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff;
  width: 90%;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const ResultItem = styled.p`
  margin: 5px 0;
  color: #333;
  font-size: 0.95em;
  word-break: break-all;

  strong {
    color: #000;
  }
`;

const ErrorMessage = styled(ResultItem)`
  color: #d8000c;
  background-color: #ffdddd;
  padding: 10px;
  border-radius: 5px;
  box-shadow: 3px 3px 6px #ccaaaa, -3px -3px 6px #ffeeee;
`;

const MotionResultsDisplay = motion(ResultsDisplay);
const MotionErrorMessage = motion(ErrorMessage);


const VerifyNotarization = () => {
  const [hashToVerify, setHashToVerify] = useState('');
  const [verificationResults, setVerificationResults] = useState(null); // Can be object or null
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contractInstance, setContractInstance] = useState(null);
  const [contractWithSigner, setContractWithSigner] = useState(null);
  const [isWalletConnected, setIsWalletConnected] = useState(false);

  useEffect(() => {
    const initContract = async () => {
      let provider;
      let signer;
      if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        try {
            const accounts = await provider.listAccounts();
            if (accounts.length > 0) {
                signer = await provider.getSigner();
                setContractWithSigner(new ethers.Contract(contractAddress, notarioABI, signer));
                setIsWalletConnected(true);
            } else {
                setIsWalletConnected(false);
            }
        } catch (e) {
            console.warn("Could not get signer, proceeding without wallet connection for view functions.", e);
            setIsWalletConnected(false);
        }
      } else {
        provider = ethers.getDefaultProvider(); // Fallback for read-only
        console.warn("MetaMask not detected. Using default provider for read-only functions.");
        setIsWalletConnected(false);
      }
      setContractInstance(new ethers.Contract(contractAddress, notarioABI, provider)); // For view functions not requiring signer
    };
    initContract();

    if (window.ethereum) {
        const handleAccountsChanged = (accounts) => {
            if (accounts.length === 0) {
                setIsWalletConnected(false);
                setContractWithSigner(null);
            } else {
                initContract(); // Re-initialize to get signer for new account
            }
        };
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
            }
        };
    }

  }, []);

  const formatTimestamp = (timestampBigInt) => {
    if (!timestampBigInt || timestampBigInt.toString() === '0') {
      return 'Not available (timestamp is 0)';
    }
    const timestampInSeconds = Number(timestampBigInt);
    return new Date(timestampInSeconds * 1000).toLocaleString();
  };

  const handleVerify = async () => {
    if (!hashToVerify) {
      setError('Please enter a hash to verify.');
      setVerificationResults(null);
      return;
    }
    if (!ethers.isBytesLike(hashToVerify) || ethers.getBytes(hashToVerify).length !== 32) {
      setError('Invalid hash format. Must be a 32-byte hex string (e.g., 0x...).');
      setVerificationResults(null);
      return;
    }
    if (!contractInstance) {
        setError('Contract not initialized. Please try again or refresh.');
        setIsLoading(false);
        return;
    }

    setError('');
    setIsLoading(true);
    setVerificationResults(null); // Clear previous results

    try {
      const existsResult = await contractInstance.exists(hashToVerify);
      const recordResult = await contractInstance.records(hashToVerify);
      const timestampResult = await contractInstance.timestamps(hashToVerify);
      
      let didNotarizeResultText = "Connect wallet to check if notarized by you.";
      if (isWalletConnected && contractWithSigner) {
        try {
            const didNotarizeByConnectedAddress = await contractWithSigner.didNotarize(hashToVerify);
            didNotarizeResultText = didNotarizeByConnectedAddress.toString();
        } catch (e) {
            console.error("Error calling didNotarize:", e);
            didNotarizeResultText = "Error checking 'didNotarize' (see console).";
        }
      } else if (isWalletConnected && !contractWithSigner) {
        // This case might happen if signer acquisition failed initially but window.ethereum is present
        didNotarizeResultText = "Wallet detected, but couldn't get signer. Try reconnecting/refreshing.";
      }


      setVerificationResults({
        exists: existsResult.toString(),
        notarizerAddress: recordResult === ethers.ZeroAddress ? '0x0 (Not notarized or self-notarized by contract)' : recordResult,
        timestamp: formatTimestamp(timestampResult),
        didNotarizeByYou: didNotarizeResultText,
      });
    } catch (err) {
      console.error("Error verifying hash:", err);
      setError(`Error: ${err.message || 'Could not verify hash.'}`);
      setVerificationResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <VerifyContainer>
        <h2>Verify Notarization Status</h2>
        <StyledInput
          value={hashToVerify}
          onChange={(e) => {
            setHashToVerify(e.target.value);
            setError(''); // Clear error on new input
            setVerificationResults(null); // Clear results on new input
          }}
          placeholder="Enter bytes32 hash to verify (e.g., 0x...)"
          disabled={isLoading}
        />
        <Button onClick={handleVerify} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : 'Verify Hash'}
        </Button>

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
        
        <AnimatePresence>
        {verificationResults && !isLoading && !error && (
          <MotionResultsDisplay
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <ResultItem><strong>Exists:</strong> {verificationResults.exists}</ResultItem>
            <ResultItem><strong>Notarizer Address:</strong> {verificationResults.notarizerAddress}</ResultItem>
            <ResultItem><strong>Timestamp:</strong> {verificationResults.timestamp}</ResultItem>
            <ResultItem><strong>Notarized by You (Connected Wallet):</strong> {verificationResults.didNotarizeByYou}</ResultItem>
          </MotionResultsDisplay>
        )}
        </AnimatePresence>
      </VerifyContainer>
    </Card>
  );
};

export default VerifyNotarization;
