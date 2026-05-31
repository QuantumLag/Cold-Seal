import { Shipment } from '../types';

export const mockShipments: Shipment[] = [
  {
    id: 'VX-2026-847A',
    vaccineType: 'mRNA-1273',
    manufacturer: 'Moderna',
    batchNumber: '037K20A',
    quantity: 10000,
    origin: 'New York, NY',
    destination: 'San Francisco, CA',
    currentLocation: 'Denver, CO',
    status: 'in-transit',
    qualityScore: 98.5,
    currentTemp: 2.3,
    currentHumidity: 45,
    departureTime: 'May 31, 14:30',
    eta: 'Jun 02, 09:15',
    route: [
      { lat: 40.7128, lng: -74.0060, location: 'New York, NY', status: 'completed', time: 'May 31, 14:30' },
      { lat: 41.8781, lng: -87.6298, location: 'Chicago, IL', status: 'completed', time: 'May 31, 18:45' },
      { lat: 39.7392, lng: -104.9903, location: 'Denver, CO', status: 'current', time: 'Jun 01, 02:15' },
      { lat: 37.7749, lng: -122.4194, location: 'San Francisco, CA', status: 'pending', time: 'Jun 02, 09:15' }
    ],
    violations: []
  },
  {
    id: 'VX-2026-923B',
    vaccineType: 'BNT162b2',
    manufacturer: 'Pfizer-BioNTech',
    batchNumber: 'FF2841',
    quantity: 15000,
    origin: 'Boston, MA',
    destination: 'Los Angeles, CA',
    currentLocation: 'Phoenix, AZ',
    status: 'in-transit',
    qualityScore: 87.2,
    currentTemp: 4.1,
    currentHumidity: 48.5,
    departureTime: 'May 30, 09:00',
    eta: 'Jun 01, 18:30',
    route: [
      { lat: 42.3601, lng: -71.0589, location: 'Boston, MA', status: 'completed', time: 'May 30, 09:00' },
      { lat: 39.7392, lng: -104.9903, location: 'Denver, CO', status: 'completed', time: 'May 30, 22:15' },
      { lat: 33.4484, lng: -112.0740, location: 'Phoenix, AZ', status: 'current', time: 'May 31, 14:45' },
      { lat: 34.0522, lng: -118.2437, location: 'Los Angeles, CA', status: 'pending', time: 'Jun 01, 18:30' }
    ],
    violations: [
      { id: '1', time: new Date().toISOString(), type: 'Temperature', value: '4.1°C' }
    ]
  },
  {
    id: 'VX-2026-156C',
    vaccineType: 'ChAdOx1',
    manufacturer: 'AstraZeneca',
    batchNumber: 'AZ8934',
    quantity: 8000,
    origin: 'Seattle, WA',
    destination: 'Miami, FL',
    currentLocation: 'Dallas, TX',
    status: 'in-transit',
    qualityScore: 95.8,
    currentTemp: 3.2,
    currentHumidity: 44.2,
    departureTime: 'May 29, 16:00',
    eta: 'Jun 02, 11:00',
    route: [
      { lat: 47.6062, lng: -122.3321, location: 'Seattle, WA', status: 'completed', time: 'May 29, 16:00' },
      { lat: 39.7392, lng: -104.9903, location: 'Denver, CO', status: 'completed', time: 'May 30, 08:30' },
      { lat: 32.7767, lng: -96.7970, location: 'Dallas, TX', status: 'current', time: 'May 31, 02:00' },
      { lat: 25.7617, lng: -80.1918, location: 'Miami, FL', status: 'pending', time: 'Jun 02, 11:00' }
    ],
    violations: []
  },
  {
    id: 'VX-2026-481D',
    vaccineType: 'mRNA-1273',
    manufacturer: 'Moderna',
    batchNumber: '041L15B',
    quantity: 5000,
    origin: 'Atlanta, GA',
    destination: 'Portland, OR',
    currentLocation: 'Kansas City, MO',
    status: 'delayed',
    qualityScore: 72.3,
    currentTemp: 5.8,
    currentHumidity: 52.1,
    departureTime: 'May 28, 11:00',
    eta: 'Jun 03, 14:00',
    route: [
      { lat: 33.7490, lng: -84.3880, location: 'Atlanta, GA', status: 'completed', time: 'May 28, 11:00' },
      { lat: 39.0997, lng: -94.5786, location: 'Kansas City, MO', status: 'current', time: 'May 30, 19:00' },
      { lat: 45.5152, lng: -122.6784, location: 'Portland, OR', status: 'pending', time: 'Jun 03, 14:00' }
    ],
    violations: [
      { id: '2', time: new Date().toISOString(), type: 'Temperature', value: '5.8°C' },
      { id: '3', time: new Date().toISOString(), type: 'Humidity', value: '52.1%' }
    ]
  },
  {
    id: 'VX-2026-729E',
    vaccineType: 'Ad26.COV2.S',
    manufacturer: 'Johnson & Johnson',
    batchNumber: 'JJ5672',
    quantity: 12000,
    origin: 'Philadelphia, PA',
    destination: 'Houston, TX',
    currentLocation: 'Houston, TX',
    status: 'delivered',
    qualityScore: 99.1,
    currentTemp: 2.8,
    currentHumidity: 45.3,
    departureTime: 'May 27, 08:30',
    eta: 'May 31, 16:00',
    route: [
      { lat: 39.9526, lng: -75.1652, location: 'Philadelphia, PA', status: 'completed', time: 'May 27, 08:30' },
      { lat: 38.9072, lng: -77.0369, location: 'Washington, DC', status: 'completed', time: 'May 27, 14:00' },
      { lat: 29.7604, lng: -95.3698, location: 'Houston, TX', status: 'completed', time: 'May 31, 16:00' }
    ],
    violations: []
  },
  {
    id: 'VX-2026-892F',
    vaccineType: 'BNT162b2',
    manufacturer: 'Pfizer-BioNTech',
    batchNumber: 'FF9123',
    quantity: 3000,
    origin: 'Minneapolis, MN',
    destination: 'Nashville, TN',
    currentLocation: 'St. Louis, MO',
    status: 'in-transit',
    qualityScore: 45.2,
    currentTemp: 8.9,
    currentHumidity: 58.7,
    departureTime: 'May 26, 13:00',
    eta: 'Jun 04, 09:00',
    route: [
      { lat: 44.9778, lng: -93.2650, location: 'Minneapolis, MN', status: 'completed', time: 'May 26, 13:00' },
      { lat: 38.6270, lng: -90.1994, location: 'St. Louis, MO', status: 'current', time: 'May 29, 11:00' },
      { lat: 36.1627, lng: -86.7816, location: 'Nashville, TN', status: 'pending', time: 'Jun 04, 09:00' }
    ],
    violations: [
      { id: '4', time: new Date().toISOString(), type: 'Temperature', value: '8.9°C' },
      { id: '5', time: new Date().toISOString(), type: 'Humidity', value: '58.7%' },
      { id: '6', time: new Date().toISOString(), type: 'Temperature', value: '9.2°C' }
    ]
  }
];
