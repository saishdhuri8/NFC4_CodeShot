"use client";

import React from 'react'
import Whiteboard from './WhiteBoard'
import {
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import CollaborativeCodeEditor from './CollaborativeCodeEditor';

export default function Board() {
    return (
        <LiveblocksProvider publicApiKey="pk_dev_HxqY-jDyORfYfSHSzxwyJbzZCAZQrHmnnT91EKWngA_jX0BkgOQJvknHaMX_7DeO">
            <RoomProvider id="my-room" initialPresence={{ cursor: null }} initialStorage={{ code: "console.log('Hello world');" }}>
                <Whiteboard />
            </RoomProvider>
        </LiveblocksProvider>
    );
}
