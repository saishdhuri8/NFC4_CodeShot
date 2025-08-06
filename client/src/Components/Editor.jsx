import { useState, useEffect } from "react";
import { RoomProvider } from "../../liveblocks.config";
import { CollaborativeEditor } from "./CollaborativeEditor";

export default function EditorWrapper() {
  const [roomId, setRoomId] = useState("");
  const [activeRoom, setActiveRoom] = useState("");
  const [showShareModal, setShowShareModal] = useState(false);

  // Get room ID from URL if exists
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRoomId = params.get("room");
    if (urlRoomId) {
      setRoomId(urlRoomId);
    }
  }, []);

  const createNewRoom = () => {
    const newRoomId = `room-${Math.random().toString(36).substring(2, 9)}`;
    setRoomId(newRoomId);
    setActiveRoom(newRoomId);
    updateUrl(newRoomId);
  };

  const joinRoom = (e) => {
    e.preventDefault();
    if (roomId.trim()) {
      setActiveRoom(roomId);
      updateUrl(roomId);
    }
  };

  const updateUrl = (roomId) => {
    const url = new URL(window.location.href);
    url.searchParams.set("room", roomId);
    window.history.pushState({}, "", url);
  };

  const copyRoomLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareModal(false);
  };

  if (activeRoom) {
    return (
      <RoomProvider id={activeRoom} initialPresence={{}}>
        <div className="flex flex-col h-screen min-h-screen bg-gray-900 text-gray-100">
          <div className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="text-sm font-mono text-gray-400">
              Room: <span className="text-blue-400">{activeRoom}</span>
            </div>
            <button
              onClick={() => setShowShareModal(true)}
              className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Share
            </button>
          </div>
          
          <CollaborativeEditor
            roomId={activeRoom}
            onShareClick={() => setShowShareModal(true)}
          />

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700 shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-white">
                    Share Room
                  </h3>
                  <button 
                    onClick={() => setShowShareModal(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    value={window.location.href}
                    readOnly
                    className="flex-1 p-2 border border-gray-600 rounded-l bg-gray-700 text-gray-200 font-mono text-sm truncate"
                  />
                  <button
                    onClick={copyRoomLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy
                  </button>
                </div>
                <div className="text-xs text-gray-400">
                  Anyone with this link will be able to join the room
                </div>
              </div>
            </div>
          )}
        </div>
      </RoomProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-blue-400 mb-3 font-mono">CodeCollab</h1>
          <p className="text-lg text-gray-400">
            Real-time collaborative code editor
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md border border-gray-700">
          <div className="flex flex-col space-y-5">
            <button
              onClick={createNewRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create New Room
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-600"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-600"></div>
            </div>

            <form onSubmit={joinRoom} className="space-y-4">
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-400 mb-2"
                >
                  Join existing room
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-white placeholder-gray-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-4 rounded-lg transition flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
                Join Room
              </button>
            </form>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Collaborate on code in real-time with your team</p>
        </div>
      </div>
    </div>
  );
}