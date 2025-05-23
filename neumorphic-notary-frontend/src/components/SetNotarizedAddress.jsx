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

const SetAddressContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
`;

const StyledInput = styled(Input)`
  width: 90%;
`;

const FeedbackMessage = styled.div`
  margin-top: 15px;
  padding: 10px 15px;
  border-radius: 5px;
  font-size: 0.9em;
  word-break: break-all;
  width: 90%;
  text-align: center;
  box-shadow: 3px 3px 6px #bebebe, -3px -3px 6px #ffffff;

  &.pending {
    color: #333;
    background-color: #e0e0e0;
  }
  &.success {
    color: #270;
    background-color: #d4edda;
    box-shadow: 3px 3px 6px #b0c0b0, -3px -3px 6px #f0fff0;
  }
  &.error {
    color: #d8000c;
    background-color: #ffdddd;
    box-shadow: 3px 3px 6px #ccaaaa, -3px -3px 6px #ffeeee;
  }
  &.warning {
    color: #856404;
    background-color: #fff3cd;
    box-shadow: 3px 3px 6px #d9c8a0, -3px -3px 6px #ffffea;
  }
`;

const MotionFeedbackMessage = motion(FeedbackMessage);

const SetNotarizedAddress = () => {
  const [newAddress, setNewAddress] = useState('');
  const [feedback, setFeedback] = useState({ message: '', type: '' }); // type: 'pending', 'success', 'error', 'warning'
  const [isLoading, setIsLoading] = useState(false);
  const [contractWithSigner, setContractWithSigner] = useState(null);

  useEffect(() => {
    const setupContract = async () => {
      if (window.ethereum) {
        try {
          const provider = new ethers.BrowserProvider(window.ethereum);
          const accounts = await provider.listAccounts();
          if (accounts.length > 0) {
            const signer = await provider.getSigner();
            const contractInstance = new ethers.Contract(contractAddress, notarioABI, signer);
            setContractWithSigner(contractInstance);
          } else {
             setFeedback({ message: 'Please connect your wallet to use this feature.', type: 'warning' });
          }
        } catch (err) {
          console.error("Error setting up contract with signer:", err);
          setFeedback({ message: 'Error connecting to wallet. Ensure MetaMask is unlocked and connected.', type: 'error' });
        }
      } else {
        setFeedback({ message: 'MetaMask not detected. Please install MetaMask.', type: 'error' });
      }
    };

    setupContract();
    if (window.ethereum) {
        window.ethereum.on('accountsChanged', setupContract); // Re-run setup on account change
        return () => {
            if (window.ethereum.removeListener) {
                window.ethereum.removeListener('accountsChanged', setupContract);
            }
        };
    }
  }, []);

  const handleSetAddress = async () => {
    if (!contractWithSigner) {
      setFeedback({ message: 'Wallet not connected or contract not initialized. Please connect your wallet.', type: 'error' });
      setIsLoading(false);
      return;
    }

    if (!ethers.isAddress(newAddress)) {
      setFeedback({ message: 'Invalid Ethereum address provided.', type: 'error' });
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    setFeedback({ message: 'Processing transaction...', type: 'pending' });

    try {
      const tx = await contractWithSigner.setNotarizedAddress(newAddress);
      setFeedback({ message: `Transaction sent! Waiting for confirmation... Tx Hash: ${tx.hash}`, type: 'pending' });
      await tx.wait();
      setFeedback({ message: `Success! Notarized address set to ${newAddress}. Tx Hash: ${tx.hash}`, type: 'success' });
      setNewAddress(''); // Clear input on success
    } catch (err) {
      console.error("Error calling setNotarizedAddress:", err);
      let errorMessage = err.reason || err.message || 'Transaction failed.';
      if (err.code === 'ACTION_REJECTED') {
        errorMessage = 'Transaction rejected by user.';
      } else if (errorMessage.includes('caller is not the owner')) {
        errorMessage = 'Caller is not authorized to perform this action.';
      }
      setFeedback({ message: `Error: ${errorMessage}`, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <SetAddressContainer>
        <h2>Set Notarized Address (Admin)</h2>
        <FeedbackMessage className="warning">
          <strong>Warning:</strong> This is an administrative function. Only authorized accounts can successfully execute this.
        </FeedbackMessage>
        <StyledInput
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
          placeholder="Enter new Ethereum address (e.g., 0x...)"
          disabled={isLoading}
        />
        <Button onClick={handleSetAddress} disabled={isLoading}>
          {isLoading ? <LoadingSpinner /> : 'Set Address'}
        </Button>
        
        <AnimatePresence>
        {feedback.message && feedback.type !== 'warning' && ( // Don't animate initial warning
            <MotionFeedbackMessage
              key={feedback.type}
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
      </SetAddressContainer>
    </Card>
  );
};

export default SetNotarizedAddress;
