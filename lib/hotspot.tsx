interface Hotspot {
  id: string;
  name: string;
  owner: string;
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
