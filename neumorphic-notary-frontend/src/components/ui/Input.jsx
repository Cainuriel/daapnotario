import React from 'react';
import styled from 'styled-components';

const StyledInput = styled.input`
  background-color: #e0e0e0;
  border: none;
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: inset 4px 4px 8px #bebebe, inset -4px -4px 8px #ffffff;
  font-size: 16px;
  color: #333;
  outline: none;
  width: 250px; /* Default width, can be overridden by parent */
  transition: box-shadow 0.15s ease-in-out, background-color 0.15s ease-in-out;

  &::placeholder {
    color: #a3a3a3;
  }

  &:focus {
    box-shadow: inset 2px 2px 4px #bebebe, inset -2px -2px 4px #ffffff;
  }

  &:disabled {
    background-color: #d1d1d1; /* Slightly darker, flatter background */
    color: #888888; /* Lighter text color for disabled state */
    cursor: not-allowed;
    /* Adjusted shadow to look more "pressed down" or flatter */
    box-shadow: inset 2px 2px 5px #b0b0b0, inset -2px -2px 5px #f0f0f0;
  }

  /* If parent component passes a width prop, it can override the default */
  ${({ width }) => width && `width: ${width};`}
`;

const Input = ({ value, onChange, placeholder, disabled, width }) => { // Added disabled and width props
  return (
    <StyledInput
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      width={width} // Pass width to styled component
    />
  );
};

export default Input;
