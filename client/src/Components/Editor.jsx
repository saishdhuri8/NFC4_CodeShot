import { useState, useEffect } from "react";
import { RoomProvider } from "../../liveblocks.config";
import { CollaborativeEditor } from "./CollaborativeEditor";
import Navbar from "./Navbar";

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
  navigator.clipboard.writeText(activeRoom);
  setShowShareModal(false);
};

  if (activeRoom) {
    return (
      <RoomProvider id={activeRoom} initialPresence={{}}>
        <div className="flex flex-col h-screen min-h-screen bg-gray-950 text-white">
          <Navbar />
          <CollaborativeEditor
            roomId={activeRoom}
            onShareClick={() => setShowShareModal(true)}
          />

          {/* Share Modal */}
          {showShareModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-gray-800 p-6 rounded-lg max-w-md w-full border border-gray-700">
                <h3 className="text-xl font-bold mb-4 text-white">
                  Share Room
                </h3>
                <div className="flex items-center mb-4">
                  <input
                    type="text"
                    value={activeRoom}
                    readOnly
                    className="flex-1 p-2 border border-gray-600 rounded-l bg-gray-700 text-white"
                  />
                  <button
                    onClick={copyRoomLink}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r"
                  >
                    Copy
                  </button>
                </div>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 rounded"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </RoomProvider>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex flex-col items-center">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">CodeCollab</h1>
          <p className="text-lg text-gray-600">
            Real-time collaborative code editor
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
          <div className="flex flex-col space-y-4">
            <button
              onClick={createNewRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition"
            >
              Create New Room
            </button>

            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-gray-300"></div>
              <span className="mx-4 text-gray-500 text-sm">OR</span>
              <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <form onSubmit={joinRoom} className="space-y-3">
              <div>
                <label
                  htmlFor="roomId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Join existing room
                </label>
                <input
                  type="text"
                  id="roomId"
                  value={roomId}
                  onChange={(e) => setRoomId(e.target.value)}
                  placeholder="Enter room ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 px-4 rounded-md transition"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
