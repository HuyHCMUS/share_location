import { RouteCoordinates } from '@/app/types/location';

class DirectionsService {
  private static API_KEY = '5b3ce3597851110001cf6248dd00a9cd533f4e01a2aa5af98e9151e6';

  static async getDirections(
    startLat: number,
    startLng: number,
    destLat: number,
    destLng: number
  ): Promise<RouteCoordinates> {
    const response = await fetch(
      'https://api.openrouteservice.org/v2/directions/driving-car',
      {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': this.API_KEY
        },
        body: JSON.stringify({
          coordinates: [[startLng, startLat], [destLng, destLat]]
        })
      }
    );
    
    const json = await response.json();
    
    if (json.error) {
      throw new Error(json.error.message);
    }
    
    if (!json.routes?.length) {
      throw new Error('No route available');
    }

    const decodedGeometry = this.decodePolyline(json.routes[0].geometry);
    return decodedGeometry.map((coord: [number, number]) => ({
      latitude: coord[0],
      longitude: coord[1]
    }));
  }

  private static decodePolyline(str: string, precision = 5): Array<[number, number]> {
    let index = 0;
    let lat = 0;
    let lng = 0;
    const coordinates: Array<[number, number]> = [];
    let shift = 0;
    let result = 0;
    let byte = null;
    let latitude_change: number;
    let longitude_change: number;
    const factor = Math.pow(10, precision || 5);

    while (index < str.length) {
      byte = null;
      shift = 0;
      result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));
      shift = result = 0;

      do {
        byte = str.charCodeAt(index++) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
      } while (byte >= 0x20);

      longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

      lat += latitude_change;
      lng += longitude_change;

      coordinates.push([lat / factor, lng / factor]);
    }

    return coordinates;
  }
}

export default DirectionsService;

