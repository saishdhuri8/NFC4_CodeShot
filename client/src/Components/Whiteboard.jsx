import { RoomProvider, useOthers } from "@liveblocks/react";
import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

function LiveCursors() {
  const others = useOthers();
  return others.map(({ connectionId, presence }) => (
    presence?.cursor && (
      <div
        key={connectionId}
        className="absolute top-0 left-0 w-4 h-4 bg-red-500 rounded-full pointer-events-none transform -translate-x-1/2 -translate-y-1/2 z-50"
        style={{
          left: presence.cursor.x,
          top: presence.cursor.y,
        }}
      />
    )
  ));
}

export default function Whiteboard({ roomId = "default-room" }) {
  return (
    <RoomProvider
      id={roomId}
      initialPresence={{ cursor: null }}
      initialStorage={{}}
    >
      <div className="flex flex-col h-screen bg-gray-100 border-4 border-gray-300 rounded-lg overflow-hidden">
        <header className="bg-white p-4 shadow-md">
          <h1 className="text-2xl font-bold text-gray-800">Collaborative Whiteboard</h1>
          <p className="text-gray-500 text-sm">Room ID: {roomId}</p>
        </header>
        
        <div className="flex-1 relative bg-white m-4 border-2 border-gray-200 rounded-md overflow-hidden">
          <Tldraw
            showMenu={true}
            showTools={true}
            persistenceKey="tldraw-liveblocks"
          />
          <LiveCursors />
        </div>
        
        <footer className="bg-white p-2 text-center text-xs text-gray-500 border-t">
          Draw together in real-time!
        </footer>
      </div>
    </RoomProvider>
  );
}