import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { encodeBase64 } from "@/lib/utils";

type MessageHandler = (message: any) => void;

type WebsocketContextType = {
	isConnected: boolean;
	sendMessage: (message: string) => void;
	callback: (cb: MessageHandler) => () => void;
};

const WebsocketContext = createContext<WebsocketContextType | undefined>(undefined);

const MAX_RETRIES = 5;
const BASE_DELAY = 1000;
const HEARTBEAT_INTERVAL = 25_000;

export const WebsocketProvider = ({ children }: { children: React.ReactNode }) => {
	const socketRef = useRef<WebSocket | null>(null);
	const retryCountRef = useRef(0);
	const reconnectTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const heartbeatIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	const listenersRef = useRef<Set<MessageHandler>>(new Set());
	const { token } = useAuth();
	const tokenRef = useRef<string | null>(token);

	const [isConnected, setIsConnected] = useState(false);

	useEffect(() => {
		tokenRef.current = token;
	}, [token]);

	const startHeartbeat = () => {
		stopHeartbeat();

		heartbeatIntervalRef.current = setInterval(() => {
			if (socketRef.current?.readyState === WebSocket.OPEN) {
				socketRef.current.send(JSON.stringify({ type: "ping" }));
				console.log("[WebsocketContext] Heartbeat sent");
			}
		}, HEARTBEAT_INTERVAL);
	};

	const stopHeartbeat = () => {
		if (heartbeatIntervalRef.current) {
			clearInterval(heartbeatIntervalRef.current);
			heartbeatIntervalRef.current = null;
		}
	};

	const connect = (currentToken: string) => {
		if (!currentToken) return;
		if (socketRef.current) return;

		console.log("[WebsocketContext] Connecting with token:", currentToken);

		const wsUrl = `${process.env.EXPO_PUBLIC_WEBSOCKET_URL}?token=${currentToken}`;
		const ws = new WebSocket(wsUrl);
		socketRef.current = ws;

		ws.onopen = () => {
			console.log("[WebsocketContext] WebSocket connected");
			retryCountRef.current = 0;
			setIsConnected(true);
			startHeartbeat();
		};

		ws.onmessage = (event) => {
			try {
				const message = JSON.parse(event.data);

				if (message.AppId !== process.env.EXPO_PUBLIC_APP_ID) return;

				listenersRef.current.forEach((cb) => cb(message));
			} catch {
				console.warn("[WebsocketContext] Invalid websocket message", event.data);
			}
		};

		ws.onerror = () => {
			console.warn("[WebsocketContext] WebSocket error");
		};

		ws.onclose = () => {
			console.log("[WebsocketContext] WebSocket closed");
			setIsConnected(false);
			socketRef.current = null;
			stopHeartbeat();

			const currentToken = tokenRef.current;
			if (!currentToken) return;

			if (retryCountRef.current < MAX_RETRIES) {
				const delay = BASE_DELAY * 2 ** retryCountRef.current;

				reconnectTimeoutRef.current = setTimeout(() => {
					retryCountRef.current += 1;
					console.log(
						"[WebsocketContext] Reconnecting attempt",
						retryCountRef.current
					);
					connect(currentToken);
				}, delay);
			} else {
				console.log("[WebsocketContext] Max retry reached");
			}
		};
	};

	useEffect(() => {
		if (!token) {
			console.log("[WebsocketContext] No token → closing socket");
			socketRef.current?.close();
			socketRef.current = null;
			setIsConnected(false);
			retryCountRef.current = 0;
			stopHeartbeat();

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
			return;
		}

		connect(token);

		return () => {
			socketRef.current?.close();
			socketRef.current = null;
			stopHeartbeat();

			if (reconnectTimeoutRef.current) {
				clearTimeout(reconnectTimeoutRef.current);
				reconnectTimeoutRef.current = null;
			}
		};
	}, [token]);

	const sendMessage = <T extends Record<string, any>>(message: T) => {
		if (socketRef.current?.readyState === WebSocket.OPEN) {
			if (message.payload) {
				message.payload = encodeBase64(message.payload);
			}
			//console.log(message);
			const str = JSON.stringify(message);
			socketRef.current.send(str);
		}
	};

	const callback = (cb: MessageHandler) => {
		listenersRef.current.add(cb);
		return () => listenersRef.current.delete(cb);
	};

	return (
		<WebsocketContext.Provider value={{ isConnected, sendMessage, callback }}>
			{children}
		</WebsocketContext.Provider>
	);
};

export const useWebsocketContext = () => {
	const context = useContext(WebsocketContext);
	if (!context) {
		throw new Error("useWebsocketContext must be used inside WebsocketProvider");
	}
	return context;
};
