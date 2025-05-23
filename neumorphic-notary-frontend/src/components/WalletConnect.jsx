import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import Button from './ui/Button'; // Use the standard Button
import { motion, AnimatePresence } from 'framer-motion';

// WalletButton is removed, using ui/Button instead

const BaseMessage = styled(motion.div)`
  margin-top: 20px;
  padding: 15px;
  border-radius: 8px; /* Consistent with Card/Button */
  background-color: #e0e0e0;
  color: #333;
  width: 100%;
  max-width: 400px; /* Limit width of messages */
  text-align: center;
  word-break: break-all;
  box-sizing: border-box;
`;

const WalletInfo = styled(BaseMessage)`
  box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff; /* Raised like a small card */
`;

const ErrorMessage = styled(BaseMessage)`
  background-color: #ffdddd; /* Light red for error */
  color: #d8000c;
  box-shadow: 6px 6px 12px #d3b8b8, -6px -6px 12px #ffecec; /* Adjusted shadow for error bg */
`;

const ConnectContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 20px; /* Add some padding around the connect button/messages */
  border-radius: 15px;
  background-color: #e0e0e0;
  box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
  margin-bottom: 20px; /* Space it out from other components */
  width: 100%;
  box-sizing: border-box;
`;


const WalletConnect = () => {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState(null);

  useEffect(() => {
    if (window.ethereum) {
      const newProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(newProvider);

      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setAccount(null);
          setError('Please connect to MetaMask.');
        } else {
          setAccount(accounts[0]);
          setError('');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Check for already connected accounts
      newProvider.listAccounts().then(accounts => {
        if (accounts.length > 0) {
          setAccount(accounts[0].address); // ethers v6 returns Account objects
        }
      }).catch(err => {
        console.error("Error fetching initial accounts:", err);
        setError('Could not fetch initial accounts.');
      });

      return () => {
        if (window.ethereum.removeListener) {
            window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
      };
    } else {
      setError('Please install MetaMask!');
    }
  }, []);

  const connectWallet = async () => {
    if (provider) {
      setIsLoading(true);
      setError('');
      try {
        const accounts = await provider.send('eth_requestAccounts', []);
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          setError('');
        } else {
          setError('No accounts found. Please ensure MetaMask is set up correctly.');
        }
      } catch (err) {
        console.error("Connection error:", err);
        if (err.code === 4001) {
          setError('Connection request rejected. Please approve in MetaMask.');
        } else {
          setError('Failed to connect wallet. See console for details.');
        }
        setAccount(null);
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('MetaMask is not available. Please install it.');
      setIsLoading(false);
    }
  };

  return (
    <ConnectContainer>
      {!account && (
        <Button onClick={connectWallet} disabled={isLoading}>
          {isLoading ? 'Connecting...' : 'Connect Wallet'}
        </Button>
      )}
      <AnimatePresence>
        {account && (
          <WalletInfo
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Connected Account: {account}
          </WalletInfo>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            Error: {error}
          </ErrorMessage>
        )}
      </AnimatePresence>
    </ConnectContainer>
  );
};

export default WalletConnect;
