import React from 'react';
import { Polyline } from 'react-native-maps';
import { RouteCoordinates } from '@/app/types/location';

type Props = {
  coordinates: RouteCoordinates;
};

function RoutePolyline({ coordinates }: Props) {
  return (
    <Polyline
      coordinates={coordinates}
      strokeColor="#0096FF"
      strokeWidth={4}
      lineDashPattern={[1]}
    />
  );
}

export default RoutePolyline;
