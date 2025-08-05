import { useEffect, useRef, useState } from 'react';

export default function useWebRTC(socket, roomId, userId, remoteUserId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [connectionState, setConnectionState] = useState('new');
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingOffersRef = useRef([]);

  useEffect(() => {
    if (!socket || !roomId || !userId) return;

    let pc;
    let cleanup = false;

    const setupWebRTC = async () => {
      try {
        console.log('🎥 Setting up WebRTC for:', userId, 'remote:', remoteUserId);
        
        // 1. Get local media stream
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { width: 640, height: 480 }, 
          audio: true 
        });
        
        if (cleanup) return; 
        
        setLocalStream(stream);
        localStreamRef.current = stream;
        console.log('✅ Local stream obtained:', stream.id);

        // 2. Create peer connection
        pc = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun.services.mozilla.com' }
          ]
        });
        pcRef.current = pc;

        // 3. Add local tracks
        stream.getTracks().forEach(track => {
          console.log('➕ Adding track:', track.kind, track.id);
          pc.addTrack(track, stream);
        });

        // 4. Handle incoming tracks (remote stream)
        pc.ontrack = (event) => {
          console.log('📺 Received remote track:', event.track.kind);
          const [remoteStream] = event.streams;
          console.log('✅ Remote stream received:', remoteStream.id);
          setRemoteStream(remoteStream);
          setIsCallActive(true);
          setConnectionState('connected');
        };

        // 5. Connection state monitoring
        pc.onconnectionstatechange = () => {
          const state = pc.connectionState;
          console.log('🔄 Connection state:', state);
          setConnectionState(state);
          
          if (state === 'connected') {
            setIsCallActive(true);
            console.log('✅ Peer connection established');
          } else if (state === 'failed' || state === 'disconnected') {
            console.log('❌ Peer connection failed/disconnected');
            setIsCallActive(false);
            setRemoteStream(null);
          }
        };

        // 6. ICE candidate handling
        pc.onicecandidate = (event) => {
          if (event.candidate && remoteUserId) {
            console.log('🧊 Sending ICE candidate to:', remoteUserId);
            socket.emit('ice-candidate', { 
              candidate: event.candidate, 
              targetUserId: remoteUserId 
            });
          } else if (!event.candidate) {
            console.log('🧊 ICE gathering complete');
          }
        };

        // 7. Process any pending offers after peer connection is ready
        if (pendingOffersRef.current.length > 0 && remoteUserId) {
          console.log('🔄 Processing pending offers:', pendingOffersRef.current.length);
          const pendingOffer = pendingOffersRef.current.find(offer => offer.senderId === remoteUserId);
          if (pendingOffer) {
            await handleOfferInternal(pendingOffer);
            pendingOffersRef.current = [];
          }
        }

        // 8. Create offer if we should initiate
        if (remoteUserId) {
          const shouldInitiate = userId.localeCompare(remoteUserId) < 0;
          
          if (shouldInitiate) {
            console.log('🚀 Creating offer as initiator');
            setConnectionState('connecting');
            
            const offer = await pc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            await pc.setLocalDescription(offer);
            
            socket.emit('offer', { offer, targetUserId: remoteUserId });
            console.log('📤 Offer sent to:', remoteUserId);
          } else {
            console.log('⏳ Waiting for offer from:', remoteUserId);
          }
        }

      } catch (error) {
        console.error('❌ WebRTC setup error:', error);
        setConnectionState('failed');
      }
    };

    // Internal offer handler (can be called from event or from pending offers)
    const handleOfferInternal = async ({ offer, senderId }) => {
      if (!pcRef.current) {
        console.log('❌ No peer connection available');
        return;
      }

      try {
        setConnectionState('connecting');
        console.log('🤝 Processing offer from:', senderId);
        
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(offer));
        console.log('✅ Remote description set from offer');
        
        const answer = await pcRef.current.createAnswer();
        await pcRef.current.setLocalDescription(answer);
        
        socket.emit('answer', { answer, targetUserId: senderId });
        console.log('📤 Answer sent to:', senderId);
        
      } catch (error) {
        console.error('❌ Error handling offer:', error);
        setConnectionState('failed');
      }
    };

    // Socket event handlers
    const handleOffer = async ({ offer, senderId }) => {
      console.log('📨 Received offer from:', senderId, 'current remote:', remoteUserId);
      
      // If we don't have a remote user yet, store the offer for later
      if (!remoteUserId) {
        console.log('⏳ Storing offer for later processing');
        pendingOffersRef.current.push({ offer, senderId });
        return;
      }
      
      // If offer is from our expected remote user, process it
      if (senderId === remoteUserId) {
        await handleOfferInternal({ offer, senderId });
      } else {
        console.log('❌ Ignoring offer from unexpected user:', senderId);
      }
    };

    const handleAnswer = async ({ answer, senderId }) => {
      console.log('📨 Received answer from:', senderId);
      if (senderId !== remoteUserId || !pcRef.current) {
        console.log('❌ Ignoring answer from:', senderId, 'expected:', remoteUserId);
        return;
      }

      try {
        await pcRef.current.setRemoteDescription(new RTCSessionDescription(answer));
        console.log('✅ Remote description set from answer');
      } catch (error) {
        console.error('❌ Error handling answer:', error);
        setConnectionState('failed');
      }
    };

    const handleIceCandidate = async ({ candidate, senderId }) => {
      if (senderId !== remoteUserId || !pcRef.current) return;
      
      try {
        await pcRef.current.addIceCandidate(new RTCIceCandidate(candidate));
        console.log('✅ ICE candidate added from:', senderId);
      } catch (error) {
        console.error('❌ Error adding ICE candidate:', error);
      }
    };

    // Register socket listeners
    socket.on('offer', handleOffer);
    socket.on('answer', handleAnswer);
    socket.on('ice-candidate', handleIceCandidate);

    // Initialize WebRTC
    setupWebRTC();

    // Cleanup function
    return () => {
      cleanup = true;
      console.log('🧹 Cleaning up WebRTC for:', userId);
      
      socket.off('offer', handleOffer);
      socket.off('answer', handleAnswer);
      socket.off('ice-candidate', handleIceCandidate);

      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          track.stop();
          console.log('🛑 Stopped track:', track.kind);
        });
        localStreamRef.current = null;
      }
      
      setLocalStream(null);
      setRemoteStream(null);
      setIsCallActive(false);
      setConnectionState('new');
      pendingOffersRef.current = [];
    };
  }, [socket, roomId, userId, remoteUserId]);

  return { 
    localStream, 
    remoteStream, 
    isCallActive, 
    connectionState,
    isConnected: connectionState === 'connected' && !!remoteStream
  };
}
