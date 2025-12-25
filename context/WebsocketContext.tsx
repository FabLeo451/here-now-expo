import React, {
	createContext,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import { useAuth } from "@/hooks/useAuth";

type MessageHandler = (message: any) => void;

type WebsocketContextType = {
	isConnected: boolean;
	sendMessage: (message: string) => void;
	callback: (cb: MessageHandler) => () => void;
};

const WebsocketContext = createContext<WebsocketContextType | undefined>(
	undefined
);

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;

export const WebsocketProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const socketRef = useRef<WebSocket | null>(null);
	const retryCountRef = useRef(0);
	const reconnectTimeoutRef =
		useRef<ReturnType<typeof setTimeout> | null>(null);

	const listenersRef = useRef<Set<MessageHandler>>(new Set());

	const [isConnected, setIsConnected] = useState(false);
	const { token } = useAuth();

	const connect = () => {
		if (!token) return;
		if (socketRef.current) return;

		const wsUrl = `${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?token=${token}`;
		const ws = new WebSocket(wsUrl);

		socketRef.current = ws;

		ws.onopen = () => {
			console.log("WebSocket connesso");
			retryCountRef.current = 0;
			setIsConnected(true);
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);
				//console.log('[WebsocketContext] received data', message);
				listenersRef.current.forEach((cb) => cb(message));
			} catch {
				console.warn("Invalid websocket message", event.data);
			}
		};

		ws.onclose = () => {
			console.log("WebSocket closed");
			setIsConnected(false);
			socketRef.current = null;

			if (!token) return;

			if (retryCountRef.current < MAX_RETRIES) {
				const delay = BASE_DELAY * 2 ** retryCountRef.current;

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
			console.log('[WebsocketContext] sending data...');
			socketRef.current.send(message);
		}
	};

	const callback = (cb: MessageHandler) => {
		console.log("[WebsocketContext] Listeners:", listenersRef.current.size);
		listenersRef.current.add(cb);

		return () => {
			console.log("[WebsocketContext] Listeners:", listenersRef.current.size);
			listenersRef.current.delete(cb);
		};
	};

	return (
		<WebsocketContext.Provider
			value={{
				isConnected,
				sendMessage,
				callback,
			}}
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
