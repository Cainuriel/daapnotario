import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledCard = styled(motion.div)`
  background-color: #e0e0e0;
  padding: 20px;
  border-radius: 15px;
  box-shadow: 8px 8px 16px #bebebe, -8px -8px 16px #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px; /* Adds space between child elements */
  margin-top: 20px; /* Adds space above the card */
  width: 100%; /* Ensure card takes full width of its container in App.jsx */
  box-sizing: border-box; /* Include padding and border in the element's total width and height */
`;

const Card = ({ children, className }) => { // Added className prop
  return (
    <StyledCard
      className={className} // Pass className for potential parent styling
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {children}
    </StyledCard>
  );
};

export default Card;
