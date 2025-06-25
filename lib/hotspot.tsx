interface Hotspot {
  id: string;
  name: string;
  position: {
    latitude: number;
    longitude: number;
  };
  startTime?: string;
  endTime?: string;
}

export { Hotspot }
