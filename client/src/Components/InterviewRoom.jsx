// client/src/components/InterviewRoom.jsx
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
  
  // 1. Initialize socket (make sure this matches your server URL)
  const socket = useSocket('http://localhost:5000');
  
  // 2. Debug connection
  useEffect(() => {
    if (!socket) return;
    
    console.log('Socket ID:', socket.id); // Check if socket connects
    
    socket.on('connect', () => {
      console.log('Connected to socket server');
      socket.emit('join-room', roomId, userId, userRole);
    });

    socket.on('disconnect', () => console.log('Disconnected'));
    socket.on('connect_error', (err) => console.error('Connection error:', err));

    return () => {
      socket.off('connect');
      socket.off('disconnect');
    };
  }, [socket, roomId, userId, userRole]);

  // 3. Get other participant's ID
  const otherUserId = userRole === 'interviewer' 
    ? null // Interviewer waits for candidate
    : 'interviewer1'; // Candidate connects to interviewer

  // 4. Initialize WebRTC
  const { localStream, remoteStream } = useWebRTC(
    socket,
    roomId,
    userId,
    otherUserId
  );

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4">
        <div className="md:w-2/3 h-64 md:h-auto">
          <VideoChat 
            localStream={localStream} 
            remoteStream={remoteStream} 
          />
        </div>
        <div className="md:w-1/3 h-64 md:h-auto">
          <ChatBox socket={socket} roomId={roomId} userId={userId} userRole={userRole} />
        </div>
      </div>
    </div>
  );
}