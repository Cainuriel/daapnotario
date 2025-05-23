import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StyledButton = styled(motion.button)`
  background-color: #e0e0e0;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  box-shadow: 6px 6px 12px #bebebe, -6px -6px 12px #ffffff;
  cursor: pointer;
  font-size: 16px;
  color: #333;
  transition: all 0.15s ease-in-out;
  outline: none;

  &:hover {
    box-shadow: 4px 4px 8px #bebebe, -4px -4px 8px #ffffff;
  }

  &:active {
    box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
  }
`;

const Button = ({ onClick, children, className, disabled }) => { // Added className and disabled
  return (
    <StyledButton
      onClick={onClick}
      className={className}
      disabled={disabled}
      whileHover={{ scale: disabled ? 1 : 1.05, boxShadow: disabled ? "6px 6px 12px #bebebe, -6px -6px 12px #ffffff" : "4px 4px 8px #bebebe, -4px -4px 8px #ffffff" }}
      whileTap={{ scale: disabled ? 1 : 0.95, boxShadow: disabled ? "6px 6px 12px #bebebe, -6px -6px 12px #ffffff" : "inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff" }}
      transition={{ duration: 0.15 }}
      style={{ opacity: disabled ? 0.7 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
    >
      {children}
    </StyledButton>
  );
};

export default Button;
