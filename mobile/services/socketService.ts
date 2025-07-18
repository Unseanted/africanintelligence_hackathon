import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { API_URL } from "../app/constants/api";
import { useTourLMS } from "../contexts/TourLMSContext";

let socket: Socket | null = null;

export const initializeSocket = (token: string) => {
  if (!socket) {
    socket = io(API_URL, {
      auth: {
        token,
      },
    });

    socket.on("connect", () => {
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }
  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const useSocket = () => {
  const { token } = useTourLMS();
  const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

  useEffect(() => {
    if (token) {
      const socket = initializeSocket(token);
      setSocketInstance(socket);
    }

    return () => {
      disconnectSocket();
    };
  }, [token]);

  return socketInstance;
};
