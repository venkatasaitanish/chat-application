import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, Button, Paper, Typography, List, ListItem, Dialog, DialogTitle, DialogActions } from '@mui/material';
import axios from 'axios';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useParams } from 'react-router-dom';

const ChatRoom = () => {
  const { roomId } = useParams();
  const [roomName, setRoomName] = useState('');
  const [username, setUsername] = useState(localStorage.getItem('username') || '');
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [showUsernameDialog, setShowUsernameDialog] = useState(!username);
  const stompClientRef = useRef(null);

  // Auto-scroll to the bottom when messages update
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch roomName from the backend
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/room/${roomId}`);
        console.log(response.data.roomName);
        setRoomName(response.data.roomName);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Fetch previous chat messages from the backend
  useEffect(() => {
    if (!roomId) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`http://localhost:8080/api/getChatHistory/${roomId}`);
        console.log(response.data);
        setMessages(response.data);
      } catch (error) {
        console.error('Error fetching messages:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  // Connect to WebSocket when the component mounts
  useEffect(() => {
    if (!username || !roomId) return;

    const socket = new SockJS('http://localhost:8080/ws');
    const stompClient = new Client({
        webSocketFactory: () => socket,
        reconnectDelay: 5000,
        debug: (str) => {
            console.log(str);
        },
        onConnect: () => {
            console.log('Connected to WebSocket');
            stompClient.subscribe(`/topic/${roomId}`, (history) => {
                const parsedHistory = JSON.parse(history.body);
                console.log(parsedHistory);
                setMessages(prevMessages => [...prevMessages, parsedHistory]);
            });
        },
        onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        },
    });

    stompClient.activate();
    stompClientRef.current = stompClient;

    return () => {
        stompClient.deactivate();
    };
  }, [username, roomId]);

  const handleSendMessage = () => {

    const stompClient = stompClientRef.current;
    if (newMessage.trim() && stompClient && stompClient.connected) {
        console.log('Sending message:', username);
        // const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const chatMessage = { sender: username, content: newMessage };
        stompClient.publish({
            destination: `/app/chat/${roomId}`,
            body: JSON.stringify(chatMessage),
        });
        setNewMessage('');
    } else {
        console.error('Stomp client is not connected');
    }
  };

  const handleSetUsername = (name) => {
    setUsername(name);
    localStorage.setItem('username', name);
    setShowUsernameDialog(false);
  };

  const formatDateTime = (timestamp) => {
    const date = new Date(timestamp);

    const day = String(date.getDate()).padStart(2, '0');
    const month = date.toLocaleString('en-US', { month: 'short' }); // Get 3-letter month
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh', // Full viewport height
        maxWidth: '70%', // Constrain width for better readability
        margin: '0 auto', // Center the chat container
        p: 2, // Padding around the chat
        boxSizing: 'border-box', // Ensure padding is included in height
      }}
    >
      {/* Ask for username if not set */}
      <Dialog open={showUsernameDialog}>
        <DialogTitle>Enter your username</DialogTitle>
        <TextField autoFocus fullWidth onChange={(e) => setUsername(e.target.value)} />
        <DialogActions>
          <Button onClick={() => handleSetUsername(username)} disabled={!username.trim()}>
            Join Chat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Chat Header */}
      <Paper
        elevation={3}
        sx={{
          mb: 2,
          p: 2,
          textAlign: 'center',
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6">Room: {roomName}</Typography>
        <Typography variant="subtitle1">User: {username}</Typography>
      </Paper>

      {/* Chat Messages */}
      <Paper
        elevation={3}
        sx={{
          flex: 1, // Take up remaining space
          overflowY: 'auto', // Enable vertical scrolling
          mb: 2, // Margin bottom for spacing
          p: 2, // Padding inside the chat container
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {loading ? <Typography>Loading messages...</Typography> : null}
        <List sx={{ flex: 1 }}>
          {messages.map((message, index) => (
            <ListItem
              key={index}
              sx={{
                justifyContent: message.sender === username ? 'flex-end' : 'flex-start',
                alignItems: 'flex-start',
                px: 1, // Padding left and right
              }}
            >
              <Box
                sx={{
                  maxWidth: '70%',
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: message.sender === username ? 'primary.main' : 'grey.300',
                  color: message.sender === username ? 'common.white' : 'text.primary',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                  {message.sender}
                </Typography>
                <Typography variant="body1">{message.content}</Typography>
                <Typography variant="caption" sx={{ display: 'block', textAlign: 'right' }}>
                  {formatDateTime(message.timeStamp)}
                </Typography>
              </Box>
            </ListItem>
          ))}
          <div ref={messagesEndRef} />
        </List>
      </Paper>

      {/* Message Input */}
      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Type a message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') handleSendMessage();
          }}
        />
        <Button variant="contained" onClick={handleSendMessage} disabled={!newMessage.trim()}>
          Send
        </Button>
      </Box>
    </Box>
  );
};

export default ChatRoom;
