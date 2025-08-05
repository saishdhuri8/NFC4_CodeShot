import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router';
import useSocket from '../hooks/useSocket';
import useWebRTC from '../hooks/useWebRTC';
import ChatBox from './ChatBox';
import VideoChat from './VideoChat';

export default function InterviewRoom() {
  const { roomId } = useParams();
  const [searchParams] = useSearchParams();
  const userId = searchParams.get('userId');
  const userRole = searchParams.get('role');
  const socket = useSocket('http://localhost:5000');

  
  const [participants, setParticipants] = useState([]);
  const [otherUserId, setOtherUserId] = useState(null);
  const [allParticipants, setAllParticipants] = useState(new Map()); // Track all participants

  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('🔌 Connected to server, joining room...');
      socket.emit('join-room', roomId, userId, userRole);
    });

    socket.on('user-connected', ({ userId: newUserId, userRole: newUserRole }) => {
      console.log('👤 User connected:', newUserId, newUserRole);
      
      // Update participants list
      setParticipants(prev => {
        const filtered = prev.filter(p => p.userId !== newUserId);
        const updated = [...filtered, { userId: newUserId, userRole: newUserRole }];
        console.log('👥 Updated participants:', updated);
        return updated;
      });

      // Update all participants map
      setAllParticipants(prev => {
        const updated = new Map(prev);
        updated.set(newUserId, { userId: newUserId, userRole: newUserRole });
        return updated;
      });

      // Set remote user for WebRTC signaling (only if different from current user)
      if (newUserId !== userId && !otherUserId) {
        console.log('🎯 Setting remote user for WebRTC:', newUserId);
        setOtherUserId(newUserId);
      }
    });

    socket.on('user-disconnected', (disconnectedUserId) => {
      console.log('👋 User disconnected:', disconnectedUserId);
      
      setParticipants(prev => {
        const updated = prev.filter(p => p.userId !== disconnectedUserId);
        console.log('👥 Updated participants after disconnect:', updated);
        return updated;
      });

      // Update all participants map
      setAllParticipants(prev => {
        const updated = new Map(prev);
        updated.delete(disconnectedUserId);
        return updated;
      });
      
      if (disconnectedUserId === otherUserId) {
        console.log('🎯 Remote user disconnected, clearing...');
        setOtherUserId(null);
      }
    });

    // Handle room join confirmation and existing participants
    socket.on('existing-messages', (messages) => {
      console.log('📜 Received existing messages:', messages.length);
      
      // Request current participants when we join
      socket.emit('get-participants', (response) => {
        if (response.success) {
          console.log('👥 Existing participants:', response.participants);
          
          // Set up existing participants
          const existingParticipants = response.participants.filter(p => p.userId !== userId);
          setParticipants(existingParticipants);
          
          // Set remote user if there's exactly one other participant
          if (existingParticipants.length === 1) {
            const otherUser = existingParticipants[0];
            console.log('🎯 Setting remote user from existing participants:', otherUser.userId);
            setOtherUserId(otherUser.userId);
          }
        }
      });
    });

    return () => {
      socket.off('connect');
      socket.off('user-connected');
      socket.off('user-disconnected');
      socket.off('existing-messages');
    };
  }, [socket, roomId, userId, userRole]);

  // WebRTC connection
  const { localStream, remoteStream, isCallActive, connectionState, isConnected } = useWebRTC(
    socket, 
    roomId, 
    userId, 
    otherUserId
  );

  // Debug information
  useEffect(() => {
    console.log('🔍 Debug Info:', {
      userId,
      userRole,
      otherUserId,
      participants: participants.length,
      hasLocalStream: !!localStream,
      hasRemoteStream: !!remoteStream,
      isCallActive,
      connectionState,
      isConnected
    });
  }, [userId, userRole, otherUserId, participants, localStream, remoteStream, isCallActive, connectionState, isConnected]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header with Debug Info */}
      <div className="bg-white shadow-sm border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Interview Room</h1>
            <p className="text-sm text-gray-600">
              Room: {roomId} • Role: <span className="capitalize font-medium">{userRole}</span>
              {otherUserId && <span className="ml-2 text-green-600">• Remote: {otherUserId}</span>}
            </p>
          </div>
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>Participants: {participants.length + 1}</span>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                socket?.connected ? 'bg-green-500' : 'bg-red-500'
              }`} />
              <span>{socket?.connected ? 'Connected' : 'Disconnected'}</span>
            </div>
            {/* Debug indicators */}
            <div className="flex items-center space-x-1 text-xs">
              <span className={`px-2 py-1 rounded ${localStream ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Local: {localStream ? 'OK' : 'No'}
              </span>
              <span className={`px-2 py-1 rounded ${remoteStream ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                Remote: {remoteStream ? 'OK' : 'No'}
              </span>
              <span className={`px-2 py-1 rounded ${isCallActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                Call: {isCallActive ? 'Active' : 'Inactive'}
              </span>
              <span className={`px-2 py-1 rounded ${otherUserId ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                Target: {otherUserId ? 'Set' : 'None'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4">
        {/* Video Section */}
        <div className="lg:w-2/3 h-96 lg:h-auto">
          <VideoChat
            localStream={localStream}
            remoteStream={remoteStream}
            isCallActive={isCallActive}
            participants={participants}
            userRole={userRole}
            connectionState={connectionState}
            otherUserId={otherUserId}
          />
        </div>
        
        {/* Chat Section */}
        <div className="lg:w-1/3 h-96 lg:h-auto">
          <ChatBox
            socket={socket}
            roomId={roomId}
            userId={userId}
            userRole={userRole}
          />
        </div>
      </div>
    </div>
  );
}
