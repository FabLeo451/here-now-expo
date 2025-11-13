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
  category: string|null;
}

export { Hotspot, Category }
