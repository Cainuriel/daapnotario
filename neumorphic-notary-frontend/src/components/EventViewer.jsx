import React, { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import styled from 'styled-components';
import Card from './ui/Card';

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
    // ... (other ABI items - can be omitted if only this event is used by this component)
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

const EventViewerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 100%;
  max-height: 400px; /* Max height for the card */
  overflow-y: auto; /* Make event list scrollable */
  padding-right: 10px; /* Avoid scrollbar overlap */

  /* Custom scrollbar for neumorphic look */
  &::-webkit-scrollbar {
    width: 12px;
  }
  &::-webkit-scrollbar-track {
    background: #e0e0e0;
    border-radius: 10px;
  }
  &::-webkit-scrollbar-thumb {
    background-color: #bebebe;
    border-radius: 10px;
    border: 3px solid #e0e0e0;
  }
  &::-webkit-scrollbar-thumb:hover {
    background-color: #a0a0a0;
  }
`;

const EventItem = styled.div`
  background-color: #e0e0e0;
  padding: 12px 18px;
  border-radius: 8px;
  box-shadow: 5px 5px 10px #bebebe, -5px -5px 10px #ffffff;
  width: 95%;
  margin-bottom: 15px;
  font-size: 0.85em;
  word-break: break-all;

  p {
    margin: 6px 0;
  }

  strong {
    color: #333;
  }
`;

const StatusMessage = styled.p`
  color: #555;
  font-style: italic;
`;

const MAX_EVENTS_DISPLAYED = 10;

const EventViewer = () => {
  const [events, setEvents] = useState([]);
  const [contractInstance, setContractInstance] = useState(null);
  const [listeningMessage, setListeningMessage] = useState("Initializing event listener...");

  const formatTimestamp = (timestampBigInt) => {
    if (!timestampBigInt || timestampBigInt.toString() === '0') {
      return 'N/A';
    }
    const timestampInSeconds = Number(timestampBigInt);
    return new Date(timestampInSeconds * 1000).toLocaleString();
  };
  
  const handleEvent = useCallback((record, notarizer, timestamp, event) => {
    // Create a unique key for the event to prevent duplicates if events are re-emitted by mistake
    // or if the listener fires multiple times for the same log (rare, but possible with some RPCs/reorgs)
    const eventKey = `${event.log.transactionHash}-${event.log.logIndex}`;

    setEvents(prevEvents => {
      // Check if event already exists
      if (prevEvents.some(e => e.key === eventKey)) {
        return prevEvents;
      }
      const newEvent = {
        key: eventKey,
        record: record.toString(),
        notarizer: notarizer.toString(),
        timestamp: formatTimestamp(timestamp),
        rawTimestamp: timestamp, // Keep raw for sorting if needed later
      };
      // Add new event to the beginning and keep only the last MAX_EVENTS_DISPLAYED
      return [newEvent, ...prevEvents].slice(0, MAX_EVENTS_DISPLAYED);
    });
  }, []);


  useEffect(() => {
    let provider;
    let contract;

    try {
        if (window.ethereum) {
            provider = new ethers.BrowserProvider(window.ethereum);
        } else {
            // Use a public RPC provider if MetaMask is not available
            // This allows listening to events without a direct wallet connection.
            provider = new ethers.JsonRpcProvider("https://sepolia.infura.io/v3/5c0b95c9b0de44c6a3a9eefbefabc03d"); 
            console.warn("MetaMask not detected. Using public RPC for event listening.");
             setListeningMessage("Using public RPC. Listening for events...");
        }

        contract = new ethers.Contract(contractAddress, notarioABI, provider);
        setContractInstance(contract);
        
        setListeningMessage("Listening for 'LogNotarized' events...");

        // Listen for new events
        contract.on('LogNotarized', handleEvent);
        
        // (Optional) Query past events - might be too much for real-time display or cause RPC issues
        // const queryPastEvents = async () => {
        //   try {
        //     const pastEvents = await contract.queryFilter('LogNotarized', -10000, 'latest'); // Last 10000 blocks
        //     const formattedPastEvents = pastEvents.map(event => ({
        //       key: `${event.transactionHash}-${event.logIndex}`,
        //       record: event.args.record.toString(),
        //       notarizer: event.args.notarizer.toString(),
        //       timestamp: formatTimestamp(event.args.timestamp),
        //       rawTimestamp: event.args.timestamp,
        //     })).reverse(); // Newest first
        //     setEvents(prev => [...formattedPastEvents, ...prev].slice(0, MAX_EVENTS_DISPLAYED));
        //   } catch (queryError) {
        //     console.error("Error querying past events:", queryError);
        //     setListeningMessage("Error fetching past events. Listening for new ones.");
        //   }
        // };
        // queryPastEvents();


    } catch (error) {
        console.error("Error setting up event listener:", error);
        setListeningMessage(`Error: ${error.message}`);
        return; // Stop if there's an error in setup
    }

    // Cleanup function
    return () => {
      if (contract) {
        contract.off('LogNotarized', handleEvent);
        console.log("Event listener for 'LogNotarized' removed.");
      }
    };
  }, [handleEvent]); // handleEvent is memoized with useCallback

  return (
    <Card>
      <h2>Recent Notarizations</h2>
      <EventViewerContainer>
        {events.length === 0 ? (
          <StatusMessage>{listeningMessage}</StatusMessage>
        ) : (
          events.map((event) => (
            <EventItem key={event.key}>
              <p><strong>Record (Hash):</strong> {event.record}</p>
              <p><strong>Notarizer:</strong> {event.notarizer}</p>
              <p><strong>Timestamp:</strong> {event.timestamp}</p>
            </EventItem>
          ))
        )}
      </EventViewerContainer>
    </Card>
  );
};

export default EventViewer;
