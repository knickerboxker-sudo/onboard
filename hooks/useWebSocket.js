"use client";

import { useEffect, useRef, useState } from "react";

export const useWebSocket = (url) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!url) {
      return undefined;
    }

    const socket = new WebSocket(url);
    socketRef.current = socket;

    socket.addEventListener("open", () => setIsConnected(true));
    socket.addEventListener("close", () => setIsConnected(false));
    socket.addEventListener("error", () => setIsConnected(false));

    return () => socket.close();
  }, [url]);

  return { socketRef, isConnected };
};
