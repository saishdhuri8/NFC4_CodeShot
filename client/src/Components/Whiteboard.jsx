import { Tldraw } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";
import { useMyPresence, useOthers } from "@liveblocks/react";
import React from "react";


function LiveCursors() {
    const others = useOthers();
    const [_, updateMyPresence] = useMyPresence();

    React.useEffect(() => {
    const handlePointerMove = (event) => {
        updateMyPresence({
        cursor: {
            x: event.clientX,
            y: event.clientY,
        },
        });
    };

    const handlePointerLeave = () => {
        updateMyPresence({ cursor: null });
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerleave", handlePointerLeave);

    return () => {
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerleave", handlePointerLeave);
    };
    }, [updateMyPresence]);


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

    export default function Whiteboard() {
    return (
        <div className="flex flex-col h-screen bg-gray-100 border-4 border-gray-300 rounded-lg overflow-hidden">
        <header className="bg-white p-4 shadow-md flex justify-between items-center">
            <div>
            <h1 className="text-2xl font-bold text-gray-800">Collaborative Whiteboard</h1>
            <p className="text-gray-500 text-sm">Room: my-room</p>
            </div>
            <div className="flex gap-2">
            <button className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md text-sm font-medium">
                Save
            </button>
            <button className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium">
                Clear
            </button>
            </div>
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
            Double-click to add text | Right-click for more options
        </footer>
        </div>
    );
}
