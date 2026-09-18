import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import socket from '../socket';
import { useAuth } from '../context/AuthContext';

const ChatBox = ({ gigId, otherUserId, onClose }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  const roomId = [gigId, [user.uid, otherUserId].sort().join('-')].join('_');

  useEffect(() => {
    socket.emit('join_room', roomId);

    const fetchHistory = async () => {
      try {
        const res = await axios.get(`/api/messages/${roomId}`);
        setMessages(res.data);
      } catch (error) {
        console.error("Error fetching message history:", error);
      }
    };
    fetchHistory();

    const handleReceive = (data) => {
      setMessages(prev => [...prev, data]);
    };
    socket.on('receive_message', handleReceive);

    return () => {
      socket.off('receive_message', handleReceive);
    };
  }, [roomId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!newMessage.trim()) return;

    const messageData = {
      roomId,
      gigId,
      senderId: user.uid,
      senderName: user.displayName,
      text: newMessage
    };

    socket.emit('send_message', messageData);
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
  };

  return (
    <div className="border border-gray-200 rounded-lg bg-white mt-3 flex flex-col h-80">
      <div className="flex justify-between items-center p-3 border-b border-gray-100">
        <p className="font-medium text-sm text-[#1E2A4A]">Chat</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm">✕</button>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {messages.length === 0 ? (
          <p className="text-xs text-gray-400 text-center">No messages yet. Say hello!</p>
        ) : (
          messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.senderId === user.uid ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] px-3 py-2 rounded-lg text-sm ${
                msg.senderId === user.uid ? 'bg-[#1E2A4A] text-white' : 'bg-gray-100 text-gray-800'
              }`}>
                {msg.senderId !== user.uid && (
                  <p className="text-xs font-medium mb-0.5 opacity-70">{msg.senderName}</p>
                )}
                {msg.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-100 flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message..."
          className="flex-1 border border-gray-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:border-[#1E2A4A]"
        />
        <button
          onClick={handleSend}
          className="bg-[#1E2A4A] text-white px-4 py-1.5 rounded-md text-sm font-medium hover:bg-[#16203a] transition"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatBox;