import { useWebsocketContext } from "../context/WebsocketContext";

export const useWebSocket = () => {
  const { isConnected, sendMessage, lastMessage } =
    useWebsocketContext();

  return {
    isConnected,
    sendMessage,
    lastMessage,
  };
};
