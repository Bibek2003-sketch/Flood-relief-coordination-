import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapProps {
  center: [number, number];
  zoom: number;
  incidents?: any[];
  shelters?: any[];
  requests?: any[];
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: [number, number] | null;
}

const MapComponent = ({ center, zoom, incidents = [], shelters = [], requests = [], onMapClick, selectedLocation }: MapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current).setView(center, zoom);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);
    }

    const map = mapInstance.current;
    if (!map) return;

    // Remove old click listeners to prevent duplicates
    map.off('click');
    if (onMapClick) {
      map.on('click', (e: L.LeafletMouseEvent) => {
        onMapClick(e.latlng.lat, e.latlng.lng);
      });
    }

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add Incident Circles (Red)
    incidents.forEach(incident => {
      if (incident.coordinates?.coordinates) {
        const [lng, lat] = incident.coordinates.coordinates;
        L.circle([lat, lng], {
          color: 'red',
          fillColor: '#f03',
          fillOpacity: 0.3,
          radius: 2000 // 2km radius
        })
        .bindPopup(`
          <strong>Incident: ${incident.incidentName}</strong><br/>
          Severity: ${incident.severity}<br/>
          Status: ${incident.status}
        `)
        .addTo(map);
      }
    });

    // Add Shelter Markers (Green)
    const shelterIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    shelters.forEach(shelter => {
      if (shelter.coordinates?.coordinates) {
        const [lng, lat] = shelter.coordinates.coordinates;
        L.marker([lat, lng], { icon: shelterIcon })
        .bindPopup(`
          <strong>Shelter: ${shelter.name}</strong><br/>
          Capacity: ${shelter.capacity}<br/>
          Occupancy: ${shelter.currentOccupancy}<br/>
          Status: ${shelter.operatingStatus}
        `)
        .addTo(map);
      }
    });

    // Add Request Markers (Orange)
    const requestIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    requests.forEach(request => {
      if (request.coordinates?.coordinates) {
        const [lng, lat] = request.coordinates.coordinates;
        L.marker([lat, lng], { icon: requestIcon })
        .bindPopup(`
          <strong>Request: ${request.requestCategory?.join(', ')}</strong><br/>
          Priority: ${request.priority}<br/>
          People: ${request.numberOfPeople}<br/>
          Status: ${request.status}
        `)
        .addTo(map);
      }
    });

    // Add Selected Location Marker (Blue)
    if (selectedLocation) {
      const [lat, lng] = selectedLocation;
      const blueIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      });
      L.marker([lat, lng], { icon: blueIcon })
        .bindPopup('<strong>Selected Location</strong>')
        .addTo(map);
    }

  }, [center, zoom, incidents, shelters, requests, selectedLocation]);

  return <div ref={mapRef} className="w-full h-full rounded-lg z-0" style={{ minHeight: '400px' }} />;
};

export default MapComponent;
