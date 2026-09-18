import { io } from 'socket.io-client';

// Backend server se connect
const socket = io('http://localhost:5000');

export default socket;