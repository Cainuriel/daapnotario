import React, { Suspense, lazy } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import LoadingSpinner from './components/ui/LoadingSpinner';

const WalletConnect = lazy(() => import('./components/WalletConnect'));
const CreateHash = lazy(() => import('./components/CreateHash'));
const NotarizeHash = lazy(() => import('./components/NotarizeHash'));
const VerifyNotarization = lazy(() => import('./components/VerifyNotarization'));
const SetNotarizedAddress = lazy(() => import('./components/SetNotarizedAddress'));
const EventViewer = lazy(() => import('./components/EventViewer'));

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
  return (
    <>
      <GlobalStyle />
      <AppContainer>
        <Title>Notary DApp</Title>

        <Suspense fallback={<LoadingSpinner />}>
          <WalletConnect />
          <CreateHash />
          <NotarizeHash />
          <VerifyNotarization />
          <SetNotarizedAddress />
          <EventViewer />
        </Suspense>

      </AppContainer>
    </>
  );
}

export default App;
