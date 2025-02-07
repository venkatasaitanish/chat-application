import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Box, TextField, Button, Typography, Paper, ToggleButton, ToggleButtonGroup, CircularProgress } from '@mui/material';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

const JoinRoom = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [roomName, setRoomName] = useState(''); // New state for room name
  const [isCreateRoom, setIsCreateRoom] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleToggle = (event, newMode) => {
    if (newMode !== null) {
      setIsCreateRoom(newMode);
      setRoomName(''); // Reset room name when switching modes
    }
  };

  const handleRoomAction = async () => {
    if (!username.trim() || !roomId.trim() || (isCreateRoom && !roomName.trim())) return;

    setLoading(true);
    try {
      if (isCreateRoom) {
        // Create Room API call (including roomName)
        await axios.post(`${API_BASE_URL}/api/room/create`, { roomId, roomName });

        // Fetch Room details after successful creation
        // const response = await axios.get(`${API_BASE_URL}/api/room/${roomId}`);
        localStorage.setItem('username', username);
        navigate(`/chat/${roomId}`);
      } else {
        // Join Room API call
        // const response = await axios.get(`${API_BASE_URL}/api/room/${roomId}`);
        localStorage.setItem('username', username);
        navigate(`/chat/${roomId}`);
      }
    } catch (error) {
      if (error.response) {
        alert(error.response.data || 'Error occurred. Please try again.');
      } else {
        alert('Network error. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default',
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: '300px', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          {isCreateRoom ? 'Create Chat Room' : 'Join Chat Room'}
        </Typography>

        {/* Toggle Button */}
        <ToggleButtonGroup
          value={isCreateRoom}
          exclusive
          onChange={handleToggle}
          sx={{ mb: 2 }}
        >
          <ToggleButton value={false}>Join Room</ToggleButton>
          <ToggleButton value={true}>Create Room</ToggleButton>
        </ToggleButtonGroup>

        {/* Username Input */}
        <TextField
          fullWidth
          label="Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Room ID Input */}
        <TextField
          fullWidth
          label="Room ID"
          variant="outlined"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          sx={{ mb: 2 }}
        />

        {/* Room Name Input (Only for Create Room) */}
        {isCreateRoom && (
          <TextField
            fullWidth
            label="Room Name"
            variant="outlined"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
            sx={{ mb: 2 }}
          />
        )}

        {/* Action Button */}
        <Button
          fullWidth
          variant="contained"
          onClick={handleRoomAction}
          disabled={loading || !username.trim() || !roomId.trim() || (isCreateRoom && !roomName.trim())}
        >
          {loading ? <CircularProgress size={24} color="inherit" /> : isCreateRoom ? 'Create Room' : 'Join Room'}
        </Button>
      </Paper>
    </Box>
  );
};

export default JoinRoom;
