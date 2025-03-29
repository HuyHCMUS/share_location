// Định nghĩa các type
export type UserLocation = {
  user_id: string;
  latitude: number;
  longitude: number;
  updated_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

export type RouteCoordinates = {
  latitude: number;
  longitude: number;
}[];

