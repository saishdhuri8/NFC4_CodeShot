import { useEffect, useRef, useState } from 'react';
import { FiMic, FiMicOff, FiVideo, FiVideoOff } from 'react-icons/fi';

export default function VideoChat({ localStream, remoteStream, isCallActive }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  useEffect(() => {
    if (localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteStream && remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 rounded-lg overflow-hidden">
      <div className="relative flex-1">
        {remoteStream && isCallActive ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-700">
            <div className="text-center text-gray-400">
              <div className="text-lg">Waiting for participant to join...</div>
              <div className="text-sm mt-2">
                {isCallActive ? 'Connecting...' : 'The video call will start automatically'}
              </div>
            </div>
          </div>
        )}
        
        {localStream && (
          <div className="absolute bottom-4 right-4 w-1/4 max-w-xs aspect-video">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full rounded-lg border-2 border-white shadow-lg object-cover"
            />
          </div>
        )}
      </div>
      
      <div className="p-3 bg-gray-900 flex justify-center gap-4">
        <button
          onClick={toggleMute}
          className={`p-3 rounded-full ${isMuted ? 'bg-red-500' : 'bg-gray-700'} text-white`}
        >
          {isMuted ? <FiMicOff size={20} /> : <FiMic size={20} />}
        </button>
        
        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full ${isVideoOff ? 'bg-red-500' : 'bg-gray-700'} text-white`}
        >
          {isVideoOff ? <FiVideoOff size={20} /> : <FiVideo size={20} />}
        </button>
      </div>
    </div>
  );
}