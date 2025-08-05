import { useEffect, useRef, useState } from 'react';

export default function useWebRTC(socket, roomId, userId, remoteUserId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const pcRef = useRef(null);

  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    const setupWebRTC = async () => {
      try {
        // 1. Get media stream
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        setLocalStream(stream);

        // 2. Create peer connection
        const pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });
        pcRef.current = pc;

        // 3. Add local tracks
        stream.getTracks().forEach(track => pc.addTrack(track, stream));

        // 4. Set up event handlers
        pc.ontrack = (event) => {
          setRemoteStream(event.streams[0]);
          setIsCallActive(true);
        };

        pc.onicecandidate = (event) => {
          if (event.candidate && remoteUserId) {
            socket.emit('ice-candidate', {
              candidate: event.candidate,
              targetUserId: remoteUserId
            });
          }
        };

        // 5. If candidate, create offer
        if (remoteUserId) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socket.emit('offer', {
            offer,
            targetUserId: remoteUserId
          });
        }

        // Socket handlers
        socket.on('offer', async ({ offer, senderId }) => {
          if (senderId === remoteUserId) {
            await pc.setRemoteDescription(new RTCSessionDescription(offer));
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            socket.emit('answer', {
              answer,
              targetUserId: remoteUserId
            });
          }
        });

        socket.on('answer', async ({ answer, senderId }) => {
          if (senderId === remoteUserId) {
            await pc.setRemoteDescription(new RTCSessionDescription(answer));
            setIsCallActive(true);
          }
        });

        socket.on('ice-candidate', async ({ candidate, senderId }) => {
          if (senderId === remoteUserId) {
            try {
              await pc.addIceCandidate(new RTCIceCandidate(candidate));
            } catch (err) {
              console.error('Error adding ICE candidate:', err);
            }
          }
        });

      } catch (err) {
        console.error('WebRTC setup error:', err);
      }
    };

    setupWebRTC();

    return () => {
      if (pcRef.current) {
        pcRef.current.close();
      }
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [socket, roomId, userId, remoteUserId]);

  return { localStream, remoteStream, isCallActive };
}