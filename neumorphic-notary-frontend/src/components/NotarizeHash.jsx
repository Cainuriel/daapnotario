import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

// ABI for the Notario contract (same as in CreateHash.jsx)
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

const NotarizeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const Section = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  padding: 15px;
  border-radius: 10px;
  background-color: #e0e0e0;
  box-shadow: inset 5px 5px 10px #bebebe, inset -5px -5px 10px #ffffff;
`;

const StyledInput = styled(Input)`
  width: 90%;
`;

const FeedbackMessage = styled.div`
  margin-top: 15px;
  padding: 10px 15px;
  border-radius: 5px;
  background-color: #e0e0e0;
  font-size: 0.9em;
  word-break: break-all;
  width: 90%;
  text-align: center;
  box-shadow: 3px 3px 6px #bebebe, -3px -3px 6px #ffffff;

  &.pending {
    color: #333;
    background-color: #e0e0e0; /* Standard neumorphic bg for pending */
  }
  &.success {
    color: #270;
    background-color: #d4edda; /* Light green for success */
    box-shadow: 3px 3px 6px #b0c0b0, -3px -3px 6px #f0fff0;
  }
  &.error {
    color: #d8000c;
    background-color: #ffdddd; /* Light red for error */
     box-shadow: 3px 3px 6px #ccaaaa, -3px -3px 6px #ffeeee;
  }
`;

const MotionFeedbackMessage = motion(FeedbackMessage);

const NotarizeHash = () => {
  const [hashWithoutSign, setHashWithoutSign] = useState('');
  const [hashWithSign, setHashWithSign] = useState('');
  const [signature, setSignature] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // type: 'pending', 'success', 'error'
  const [isLoading, setIsLoading] = useState({ withoutSign: false, withSign: false });
  const [contractWithSigner, setContractWithSigner] = useState(null);

  useEffect(() => {
    const setupContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, notarioABI, signer);
          setContractWithSigner(contractInstance);
        } catch (err) {
          console.error("Error setting up contract with signer:", err);
          setFeedback({ message: 'Error connecting to wallet. Ensure MetaMask is unlocked and connected.', type: 'error' });
        }
      } else {
        setFeedback({ message: 'MetaMask not detected. Please install MetaMask to notarize hashes.', type: 'error' });
      }
    };
    setupContract();
  }, []);
  
  const handleNotarize = async (mode) => {
    if (!contractWithSigner) {
      setFeedback({ message: 'Contract not initialized or wallet not connected properly.', type: 'error' });
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
          const contractInstance = new ethers.Contract(contractAddress, notarioABI, signer);
          setContractWithSigner(contractInstance);
          setFeedback({ message: 'Wallet connected. Please try again.', type: 'pending' });
        } catch (err) {
          console.error("Re-initialization error:", err);
          setFeedback({ message: 'Failed to connect wallet. Please check MetaMask.', type: 'error' });
        }
      } else {
        setFeedback({ message: 'MetaMask not detected. Please install MetaMask.', type: 'error' });
      }
      return;
    }

    setIsLoading(prev => ({ ...prev, [mode]: true }));
    setFeedback({ message: '', type: '' }); // Clear previous feedback

    let currentHash = mode === 'withoutSign' ? hashWithoutSign : hashWithSign;

    if (!ethers.isBytesLike(currentHash) || ethers.getBytes(currentHash).length !== 32) {
      setFeedback({ message: 'Invalid hash format. Must be a 32-byte hex string (e.g., 0x...).', type: 'error' });
      setIsLoading(prev => ({ ...prev, [mode]: false }));
      return;
    }
    if (mode === 'withSign' && !ethers.isBytesLike(signature)) {
      setFeedback({ message: 'Invalid signature format. Must be a hex string (e.g., 0x...).', type: 'error' });
      setIsLoading(prev => ({ ...prev, [mode]: false }));
      return;
    }

    setFeedback({ message: 'Processing transaction...', type: 'pending' });

    try {
      let tx;
      if (mode === 'withoutSign') {
        tx = await contractWithSigner.notarizeWithoutSign(currentHash);
      } else {
        tx = await contractWithSigner.notarizeWithSign(currentHash, signature);
      }
      
      setFeedback({ message: `Transaction sent! Waiting for confirmation... Tx Hash: ${tx.hash}`, type: 'pending' });
      await tx.wait();
      setFeedback({ message: `Success! Hash notarized. Tx Hash: ${tx.hash}`, type: 'success' });
    } catch (err) {
      console.error(`Error during notarization (${mode}):`, err);
      let errorMessage = err.reason || err.message || 'Transaction failed.';
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user.';
      }
      setFeedback({ message: `Error: ${errorMessage}`, type: 'error' });
    } finally {
      setIsLoading(prev => ({ ...prev, [mode]: false }));
    }
  };


  return (
    <Card>
      <NotarizeContainer>
        <h2>Notarize Hash</h2>

        <Section>
          <h3>Notarize without Signature</h3>
          <StyledInput
            value={hashWithoutSign}
            onChange={(e) => setHashWithoutSign(e.target.value)}
            placeholder="Enter bytes32 hash (e.g., 0x...)"
            disabled={isLoading.withoutSign}
          />
          <Button onClick={() => handleNotarize('withoutSign')} disabled={isLoading.withoutSign}>
            {isLoading.withoutSign ? <LoadingSpinner /> : 'Notarize without Signature'}
          </Button>
        </Section>

        <Section>
          <h3>Notarize with Signature</h3>
          <StyledInput
            value={hashWithSign}
            onChange={(e) => setHashWithSign(e.target.value)}
            placeholder="Enter bytes32 hash (e.g., 0x...)"
            disabled={isLoading.withSign}
          />
          <StyledInput
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            placeholder="Enter bytes signature (e.g., 0x...)"
            disabled={isLoading.withSign}
          />
          <Button onClick={() => handleNotarize('withSign')} disabled={isLoading.withSign}>
            {isLoading.withSign ? <LoadingSpinner /> : 'Notarize with Signature'}
          </Button>
        </Section>

        <AnimatePresence>
          {feedback.message && (
            <MotionFeedbackMessage
              key={feedback.type} // Key change can help re-trigger animation if type changes
              className={feedback.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {feedback.message}
            </MotionFeedbackMessage>
          )}
        </AnimatePresence>
      </NotarizeContainer>
    </Card>
  );
};

export default NotarizeHash;
