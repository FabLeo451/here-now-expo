interface Category {
    value: string;
    label: string;
}

interface Hotspot {
    id: string;
    name: string;
    description: string;
    owner: string;
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
    category: string | null;
}

function isActive(h: Hotspot): boolean {
    if (!h.enabled || !h.startTime || !h.endTime) return false;

    const now = new Date();
    const start = new Date(h.startTime);
    const end = new Date(h.endTime);

    return now >= start && now <= end;
}


export { Hotspot, Category, isActive }
