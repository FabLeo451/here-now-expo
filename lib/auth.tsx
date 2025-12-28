

const isTokenValid = (token: string): boolean => {
	try {
		const payloadBase64 = token.split('.')[1];
		const payloadJson = atob(payloadBase64);
		const payload = JSON.parse(payloadJson);
		if (!payload.exp) return true;
		const now = Math.floor(Date.now() / 1000);
		return payload.exp > now;
	} catch (err) {
		console.error('Error decoding token JWT:', err);
		return false;
	}
};

export { isTokenValid }
