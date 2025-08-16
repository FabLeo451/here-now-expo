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
}

export { Hotspot }
