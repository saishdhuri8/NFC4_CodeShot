import { createClient } from "@liveblocks/client";
import { createRoomContext } from "@liveblocks/react";

const client = createClient({
  publicApiKey: "pk_dev_HxqY-jDyORfYfSHSzxwyJbzZCAZQrHmnnT91EKWngA_jX0BkgOQJvknHaMX_7DeO",
});

// Make sure these are all exported
export const {
  
  RoomProvider,
  useRoom,
  useMyPresence,
  useUpdateMyPresence,
  useSelf,
  useOthers,
  useBroadcastEvent,
  useEventListener, 
  useStorage,
  useMutation,
} = createRoomContext(client);