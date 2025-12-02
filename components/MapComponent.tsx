import React, { useEffect, useRef } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { Icon, Style } from 'ol/style';
import { Translate } from 'ol/interaction';
import { Collection } from 'ol';
import { Coordinates } from '../types';

interface MapComponentProps {
  coords: Coordinates;
  onLocationChange: (coords: Coordinates) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ coords, onLocationChange }) => {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<Map | null>(null);
  const markerFeatureRef = useRef<Feature | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapElement.current) return;

    // Create Marker Feature
    const markerFeature = new Feature({
      geometry: new Point(fromLonLat([coords.longitude, coords.latitude])),
    });
    
    // Style the marker
    const markerStyle = new Style({
      image: new Icon({
        anchor: [0.5, 1], // Bottom center
        src: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png', // Reusing the nice leaflet icon
        scale: 1.2
      }),
    });
    markerFeature.setStyle(markerStyle);
    markerFeatureRef.current = markerFeature;

    // Vector Source & Layer for Marker
    const vectorSource = new VectorSource({
      features: [markerFeature],
    });
    const vectorLayer = new VectorLayer({
      source: vectorSource,
      zIndex: 10,
    });

    // Create Map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        new TileLayer({
          source: new OSM(),
        }),
        vectorLayer,
      ],
      view: new View({
        center: fromLonLat([coords.longitude, coords.latitude]),
        zoom: 16,
      }),
      controls: [], // Minimal controls
    });

    // Add Translate Interaction (Drag Marker)
    const translate = new Translate({
      features: new Collection([markerFeature]),
    });
    
    translate.on('translateend', (evt) => {
      // Get new coordinates
      const geometry = markerFeature.getGeometry();
      if (geometry instanceof Point) {
        const flatCoords = geometry.getCoordinates();
        const lonLat = toLonLat(flatCoords);
        onLocationChange({
          latitude: lonLat[1],
          longitude: lonLat[0],
        });
      }
    });

    initialMap.addInteraction(translate);
    mapRef.current = initialMap;

    return () => {
      initialMap.setTarget(undefined);
    };
  }, []); // Run once on mount

  // Update Map & Marker when coords prop changes
  useEffect(() => {
    if (!mapRef.current || !markerFeatureRef.current) return;

    const view = mapRef.current.getView();
    const currentCenter = view.getCenter();
    const newCenter = fromLonLat([coords.longitude, coords.latitude]);

    // Update Marker Position
    const geometry = markerFeatureRef.current.getGeometry();
    if (geometry instanceof Point) {
        geometry.setCoordinates(newCenter);
    }

    // Smooth animate to new center if distance is significant
    // to avoid jitter when dragging (dragging updates props, which triggers this)
    if (currentCenter) {
        const dx = currentCenter[0] - newCenter[0];
        const dy = currentCenter[1] - newCenter[1];
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        // Only animate if the change wasn't caused by a small drag
        // or if it's a big jump (like a search result)
        if (dist > 500) { 
             view.animate({
                center: newCenter,
                duration: 500
            });
        } else {
             // For small updates (or drag sync), just set center if needed
             // but if we are dragging, we don't want to force reset view center constantly
             // So we might just leave the view alone unless it's a "jump"
             // But for initial load or search, we want to center.
        }
    } else {
        view.setCenter(newCenter);
    }
    
  }, [coords]);

  return (
    <div 
      ref={mapElement} 
      className="w-full h-full rounded-2xl overflow-hidden shadow-inner border border-gray-200 relative z-0 touch-none"
    />
  );
};

export default MapComponent;