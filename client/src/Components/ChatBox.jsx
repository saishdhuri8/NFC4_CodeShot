import { useState, useEffect, useRef } from 'react';
import { FiSend } from 'react-icons/fi';

export default function ChatBox({ socket, roomId, userId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleExistingMessages = (existingMessages) => {
      setMessages(existingMessages);
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('existing-messages', handleExistingMessages);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('existing-messages', handleExistingMessages);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (newMessage.trim() && socket) {
      socket.emit('send-message', newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <h3 className="font-medium text-gray-800">Chat</h3>
      </div>
      
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.userId === userId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                    message.userId === userId
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    {message.userRole} • {new Date(message.timestamp).toLocaleTimeString()}
                  </div>
                  <div className="whitespace-pre-wrap break-words">{message.text}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className="p-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}