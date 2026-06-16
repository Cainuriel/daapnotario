import React, { useState } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';
import { motion, AnimatePresence } from 'framer-motion';

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
