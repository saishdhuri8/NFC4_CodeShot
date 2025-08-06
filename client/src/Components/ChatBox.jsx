import { useState, useEffect, useRef } from 'react';
import { FiSend, FiUser } from 'react-icons/fi';

export default function ChatBox({ socket, roomId, userId, userRole }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [participants, setParticipants] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (message) => {
      setMessages((prev) => [...prev, message]);
    };

    const handleExistingMessages = (existingMessages) => {
      setMessages(existingMessages);
    };

    const handleUserConnected = ({ userId: newUserId, userRole: newUserRole }) => {
      setParticipants(prev => {
        const exists = prev.find(p => p.userId === newUserId);
        if (!exists) {
          return [...prev, { userId: newUserId, userRole: newUserRole }];
        }
        return prev;
      });
    };

    const handleUserDisconnected = (disconnectedUserId) => {
      setParticipants(prev => prev.filter(p => p.userId !== disconnectedUserId));
    };

    socket.on('receive-message', handleReceiveMessage);
    socket.on('existing-messages', handleExistingMessages);
    socket.on('user-connected', handleUserConnected);
    socket.on('user-disconnected', handleUserDisconnected);

    return () => {
      socket.off('receive-message', handleReceiveMessage);
      socket.off('existing-messages', handleExistingMessages);
      socket.off('user-connected', handleUserConnected);
      socket.off('user-disconnected', handleUserDisconnected);
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

  const getRoleColor = (role) => {
    return role === 'interviewer' 
      ? 'bg-blue-500 text-white' 
      : 'bg-green-500 text-white';
  };

  const getRoleIcon = (role) => {
    return role === 'interviewer' ? '👨‍💼' : '👨‍💻';
  };

  const isOwnMessage = (messageUserId) => messageUserId === userId;

  return (
    <div className="flex flex-col h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      {/* Header */}
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-gray-800">Chat</h3>
          <div className="flex items-center space-x-2 text-xs text-gray-600">
            <span>{participants.length + 1} participants</span>
          </div>
        </div>
      </div>
      
      {/* Messages Area */}
      <div className="flex-1 p-3 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiUser className="w-6 h-6 text-gray-400" />
              </div>
              <p>No messages yet.</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${isOwnMessage(message.userId) ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs md:max-w-md ${isOwnMessage(message.userId) ? 'order-2' : 'order-1'}`}>
                  {/* Message bubble */}
                  <div
                    className={`rounded-2xl px-4 py-2 ${
                      isOwnMessage(message.userId)
                        ? message.userRole === 'interviewer'
                          ? 'bg-blue-500 text-white rounded-br-md'
                          : 'bg-green-500 text-white rounded-br-md'
                        : message.userRole === 'interviewer'
                          ? 'bg-blue-100 text-blue-900 rounded-bl-md'
                          : 'bg-green-100 text-green-900 rounded-bl-md'
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words text-sm">
                      {message.text}
                    </div>
                  </div>
                  
                  {/* Message info */}
                  <div className={`mt-1 flex items-center space-x-2 text-xs text-gray-500 ${
                    isOwnMessage(message.userId) ? 'justify-end' : 'justify-start'
                  }`}>
                    <span className="flex items-center space-x-1">
                      <span>{getRoleIcon(message.userRole)}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getRoleColor(message.userRole)}`}>
                        {message.userRole}
                      </span>
                    </span>
                    <span>{new Date(message.timestamp).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}</span>
                    {isOwnMessage(message.userId) && <span>✓</span>}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      
      {/* Input Area */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message as ${userRole}...`}
            className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim()}
            className={`p-2 rounded-md transition-colors ${
              newMessage.trim()
                ? userRole === 'interviewer' 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            <FiSend className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
