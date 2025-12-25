import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useAuth } from "@/hooks/useAuth";

type WebsocketContextType = {
	isConnected: boolean;
	sendMessage: (message: string) => void;
	lastMessage: string | null;
};

const WebsocketContext = createContext<WebsocketContextType | undefined>(
	undefined
);

const MAX_RETRIES = 5;
const BASE_DELAY = 1000; // 1s

export const WebsocketProvider = ({ children }: { children: React.ReactNode }) => {
	const socketRef = useRef<WebSocket | null>(null);
	const retryCountRef = useRef(0);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const [isConnected, setIsConnected] = useState(false);
	const [lastMessage, setLastMessage] = useState<string | null>(null);

	const { token } = useAuth();

	const connect = () => {
		if (!token) return;
		if (socketRef.current) return; // evita doppie connessioni

		const wsUrl = `${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?token=${token}`;
		const ws = new WebSocket(wsUrl);

		socketRef.current = ws;

		ws.onopen = () => {
			console.log("WebSocket connesso");
			retryCountRef.current = 0;
			setIsConnected(true);
		};

		ws.onmessage = (event) => {
			setLastMessage(event.data);
		};

		ws.onerror = () => {
			// onclose gestirà il reconnect
		};

		ws.onclose = () => {
			console.log("WebSocket chiuso");
			setIsConnected(false);
			socketRef.current = null;

			if (!token) return; // logout → stop reconnect

			if (retryCountRef.current < MAX_RETRIES) {
				const delay =
					BASE_DELAY * Math.pow(2, retryCountRef.current);

				console.log(`Reconnect tra ${delay}ms`);

				const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
				reconnectTimeoutRef.current = setTimeout(() => {
					retryCountRef.current += 1;
					connect();
				}, delay);
			} else {
				console.log("Max retry raggiunti");
			}
		};
	};

	useEffect(() => {
		if (!token) {
			// logout → cleanup totale
			socketRef.current?.close();
			socketRef.current = null;
			setIsConnected(false);
			retryCountRef.current = 0;

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
			}
			return;
		}

		connect();

		return () => {
			socketRef.current?.close();
			socketRef.current = null;
		};
	}, [token]);

	const sendMessage = (message: string) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			socketRef.current.send(message);
		}
	};

	return (
		<WebsocketContext.Provider
			value={{ isConnected, sendMessage, lastMessage }}
		>
			{children}
		</WebsocketContext.Provider>
	);
};

export const useWebsocketContext = () => {
	const context = useContext(WebsocketContext);
	if (!context) {
		throw new Error(
			"useWebsocketContext deve essere usato dentro WebsocketProvider"
		);
	}
	return context;
};
