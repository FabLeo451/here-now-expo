interface Category {
	value: string;
	label: string;
}

interface Hotspot {
	id: string;
	name: string;
	description: string;
	owner: string;
	ownedByMe: boolean;
	enabled: boolean;
	private: boolean;
	position: {
		latitude: number;
		longitude: number;
	};
	startTime?: string;
	endTime?: string;
	likes: number;
	likedByMe: boolean;
	subscriptions: number;
	subscribed: boolean;
	category: string | null;
}

function isActive(h: Hotspot): boolean {
	if (!h.enabled || !h.startTime || !h.endTime) return false;

	const now = new Date();
	const start = new Date(h.startTime);
	const end = new Date(h.endTime);

	return now >= start && now <= end;
}

const getMyHotspots = async (token: string, timeoutMs = 5000): Promise<Hotspot[]> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(`${process.env.EXPO_PUBLIC_API_BASE_URL}/hotspot`, {
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Authorization: token,
			},
			signal: controller.signal,
		});

		if (!response.ok) {
			console.log(response)
			throw new Error('Failed to fetch: ' + response.status + ' ' + response.statusText);
		}

		const data: Hotspot[] = await response.json();
		return data;
	} catch (error: any) {
		console.log('[getMyHotspots] ', error);
		return ([])
	} finally {
		clearTimeout(timeoutId);
	}
};

const getMyHSubscriptionsCount = async (
	token: string,
	timeoutMs = 5000
): Promise<number> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

	try {
		const response = await fetch(
			`${process.env.EXPO_PUBLIC_API_BASE_URL}/mysubscriptions?count`,
			{
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					Authorization: token,
				},
				signal: controller.signal,
			}
		);

		if (!response.ok) {
			throw new Error(`HTTP error ${response.status}`);
		}

		const payload = (await response.json()) as { count: number };
		return payload.count;
	} catch (error: any) {
		if (error.name === 'AbortError') {
			console.warn('[getMyHSubscriptionsCount] Timeout');
		} else {
			console.log('[getMyHSubscriptionsCount]', error);
		}
		return 0;
	} finally {
		clearTimeout(timeoutId);
	}
};

export { Hotspot, Category, isActive, getMyHotspots, getMyHSubscriptionsCount }
