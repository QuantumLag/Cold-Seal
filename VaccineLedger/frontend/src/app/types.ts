export interface Shipment {
  id: string;
  vaccineType: string;
  manufacturer: string;
  batchNumber: string;
  quantity: number;
  origin: string;
  destination: string;
  currentLocation: string;
  status: 'in-transit' | 'delivered' | 'delayed';
  qualityScore: number;
  currentTemp: number;
  currentHumidity: number;
  departureTime: string;
  eta: string;
  route: RouteStop[];
  violations: Violation[];
}

export interface RouteStop {
  lat: number;
  lng: number;
  location: string;
  status: 'completed' | 'current' | 'pending';
  time: string;
}

export interface Violation {
  id: string;
  time: string;
  type: string;
  value: string;
}

export type QualityStatus = 'excellent' | 'good' | 'warning' | 'critical' | 'destroyed';

export interface QualityTag {
  status: QualityStatus;
  label: string;
  description: string;
  color: string;
  bgColor: string;
  borderColor: string;
}
