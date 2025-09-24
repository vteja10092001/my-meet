import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Navbar from '../components/Navbar';

const Home = () => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const navigate = useNavigate();

  const handleCreateRoom = () => {
    if (!username.trim()) return alert("Enter your name");
    const newRoomId = uuidv4();
    navigate(`/room/${roomId}?name=${encodeURIComponent(username)}`);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100 px-4">
      <Navbar />
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">Welcome to My Meetings</h1>

        <input
          type="text"
          placeholder="Your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full mb-3 px-4 py-2 border rounded focus:outline-none focus:ring"
        />

        <input
          type="text"
          placeholder="Room ID (for joining)"
          value={roomId}
          onChange={(e) => setRoomId(e.target.value)}
          className="w-full mb-4 px-4 py-2 border rounded focus:outline-none focus:ring"
        />

        <div className="flex space-x-4">
          <button
            onClick={handleCreateRoom}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Join Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
