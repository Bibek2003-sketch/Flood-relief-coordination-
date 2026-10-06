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
  floodLocation?: [number, number] | null;
  selectedShelterLocation?: [number, number] | null;
  onShelterClick?: (shelter: any) => void;
}

const MapComponent = ({ 
  center, 
  zoom, 
  incidents = [], 
  shelters = [], 
  requests = [], 
  onMapClick, 
  selectedLocation,
  floodLocation,
  selectedShelterLocation,
  onShelterClick
}: MapProps) => {
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

    // Clear existing markers, circles, and polylines
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle || layer instanceof L.Polyline) {
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
          radius: 2000
        })
        .bindPopup(`
          <strong>Incident: ${incident.incidentName}</strong><br/>
          Severity: ${incident.severity}<br/>
          Status: ${incident.status}
        `)
        .addTo(map);
      }
    });

    // Shelter Icons
    const greenShelterIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    const fullShelterIcon = new L.Icon({
      iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41]
    });

    shelters.forEach(shelter => {
      if (shelter.coordinates?.coordinates) {
        const [lng, lat] = shelter.coordinates.coordinates;
        const isFull = shelter.operatingStatus === 'Full' || shelter.currentOccupancy >= shelter.capacity;
        const marker = L.marker([lat, lng], { icon: isFull ? fullShelterIcon : greenShelterIcon })
          .bindPopup(`
            <div style="min-width: 180px;">
              <strong style="color: #0891b2; font-size: 14px;">${shelter.name}</strong><br/>
              <span style="color: #4b5563; font-size: 12px;">${shelter.address || ''}</span><br/>
              <div style="margin-top: 6px; font-size: 12px;">
                <strong>Capacity:</strong> ${shelter.currentOccupancy} / ${shelter.capacity} spots<br/>
                <strong>Status:</strong> <span style="font-weight: bold; color: ${isFull ? '#dc2626' : '#16a34a'}">${shelter.operatingStatus || (isFull ? 'Full' : 'Open')}</span>
              </div>
            </div>
          `)
          .addTo(map);

        if (onShelterClick) {
          marker.on('click', () => onShelterClick(shelter));
        }
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

    // Add Flood Location Marker (Red Pin with pulsing circle)
    const activeFloodLoc = floodLocation || null;
    if (activeFloodLoc) {
      const [fLat, fLng] = activeFloodLoc;
      const floodMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        iconSize: [28, 45],
        iconAnchor: [14, 45],
        popupAnchor: [1, -38],
        shadowSize: [41, 41]
      });

      L.marker([fLat, fLng], { icon: floodMarkerIcon })
        .bindPopup('<strong>📍 Flood Occurrence Point</strong><br/>Your designated location')
        .addTo(map);

      L.circle([fLat, fLng], {
        color: '#ef4444',
        fillColor: '#ef4444',
        fillOpacity: 0.15,
        radius: 1200
      }).addTo(map);
    }

    // Connect Flood Location to Selected Shelter with Dashed Line
    if (activeFloodLoc && selectedShelterLocation) {
      const lineCoords: [number, number][] = [activeFloodLoc, selectedShelterLocation];
      L.polyline(lineCoords, {
        color: '#06b6d4',
        weight: 3,
        dashArray: '6, 8',
        opacity: 0.85
      }).addTo(map);
    }

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
        .bindPopup(`<strong>Selected Location</strong><br/>${lat.toFixed(5)}, ${lng.toFixed(5)}`)
        .addTo(map);

      map.flyTo([lat, lng], Math.max(map.getZoom(), 14), {
        duration: 1.2
      });
    } else if (selectedShelterLocation) {
      map.flyTo(selectedShelterLocation, Math.max(map.getZoom(), 15), {
        duration: 1.2
      });
    } else if (activeFloodLoc) {
      map.flyTo(activeFloodLoc, Math.max(map.getZoom(), 13), {
        duration: 1
      });
    }
  }, [center, zoom, incidents, shelters, requests, selectedLocation, floodLocation, selectedShelterLocation]);

  return <div ref={mapRef} className="w-full h-full rounded-lg z-0" style={{ minHeight: '400px' }} />;
};

export default MapComponent;
