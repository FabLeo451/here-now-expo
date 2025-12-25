import { subscribe } from "expo-router/build/link/linking";
import { useWebsocketContext } from "@/context/WebsocketContext";

export const useWebsocket = () => {
  const { isConnected, sendMessage, callback } =
    useWebsocketContext();

  return {
    isConnected,
    sendMessage,
    callback
  };
};
