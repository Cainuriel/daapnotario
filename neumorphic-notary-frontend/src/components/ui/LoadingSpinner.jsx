import React from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled(motion.div)`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

const StyledSpinner = styled(motion.div)`
  width: 24px; /* Slightly smaller */
  height: 24px;
  border: 3px solid rgba(0, 0, 0, 0.1); /* Softer border */
  border-top: 3px solid #666; /* Accent color */
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
  /* Adding a subtle neumorphic touch to the spinner itself */
  box-shadow: 1px 1px 2px #bebebe, -1px -1px 2px #ffffff;
`;

const LoadingSpinner = ({ initial = { opacity: 0 }, animate = { opacity: 1 }, transition = { duration: 0.3 } }) => (
  <SpinnerContainer initial={initial} animate={animate} transition={transition}>
    <StyledSpinner />
  </SpinnerContainer>
);

export default LoadingSpinner;
