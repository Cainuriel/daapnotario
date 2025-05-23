import React, { useState } from 'react';
import WalletConnect from './components/WalletConnect';
import Button from './components/ui/Button';
import Input from './components/ui/Input';
import Card from './components/ui/Card';
import CreateHash from './components/CreateHash';
import NotarizeHash from './components/NotarizeHash';
import VerifyNotarization from './components/VerifyNotarization';
import SetNotarizedAddress from './components/SetNotarizedAddress';
import EventViewer from './components/EventViewer'; // Import the new component
import styled, { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: #e0e0e0;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    margin: 0;
    font-family: 'Arial', sans-serif;
    padding: 20px;
    box-sizing: border-box;
  }
`;

const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px; /* Reduced padding for smaller screens */
  background-color: #e0e0e0;
  border-radius: 20px;
  box-shadow: 15px 15px 30px #bebebe, -15px -15px 30px #ffffff;
  max-width: 700px; /* Slightly wider for better component spacing */
  width: 100%;
  gap: 25px; /* Consistent gap between main components/cards */
`;

// DemoSection is removed

const Title = styled.h1`
  color: #333;
  text-shadow: 1px 1px 2px #bebebe, -1px -1px 2px #ffffff;
  margin-bottom: 20px;
  text-align: center;
`;

function App() {
  const [inputValue, setInputValue] = useState('');

  const handleButtonClick = () => {
    alert('Button clicked!');
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Title>Neumorphic Notary DApp</Title>
        
        {/* WalletConnect is already a Card-like container */}
        <WalletConnect /> 

        {/* Each main functional component is already a Card */}
        <CreateHash />
        <NotarizeHash />
        <VerifyNotarization />
        <SetNotarizedAddress />
        <EventViewer />

        {/* The UI Components Demo card is removed as per the plan */}

      </AppContainer>
    </>
  );
}

export default App;
