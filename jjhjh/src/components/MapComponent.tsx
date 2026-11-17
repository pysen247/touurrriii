/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Component, useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  APIProvider, 
  Map, 
  AdvancedMarker, 
  Pin, 
  InfoWindow, 
  useMap, 
  useMapsLibrary,
  useAdvancedMarkerRef
} from '@vis.gl/react-google-maps';
import { 
  ShieldCheck, 
  Search, 
  AlertOctagon, 
  Sliders, 
  LocateFixed, 
  Globe,
  Map as MapIcon,
  Compass
} from 'lucide-react';
import { SafetyZone, SmartPOI } from '../types';

interface MapComponentProps {
  safetyZones: SafetyZone[];
  pois: SmartPOI[];
  sosActive: boolean;
  sosCoords: { lat: number; lng: number };
  userCoords?: { lat: number; lng: number };
  focusCoords?: { lat: number; lng: number } | null;
  language?: string;
  t?: (key: string) => string;
}

const RAW_KEY = 
  (typeof process !== 'undefined' && process.env?.GOOGLE_MAPS_PLATFORM_KEY) ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

function isValidGoogleMapsKey(key: string | undefined): boolean {
  if (!key) return false;
  const trimmed = key.trim();
  if (
    !trimmed || 
    trimmed === 'MY_GOOGLE_MAPS_KEY' || 
    trimmed === 'YOUR_API_KEY' || 
    trimmed === 'MY_GOOGLE_MAPS_PLATFORM_KEY' ||
    trimmed.startsWith('MY_') ||
    trimmed.includes('PLACEHOLDER') ||
    trimmed.length < 20
  ) {
    return false;
  }
  return true;
}

// Helper utilities to extract safe string representation from Google Maps objects
function safeStringTitle(place: any): string {
  if (!place) return 'Searched Place';
  if (typeof place.displayName === 'string') return place.displayName;
  if (place.displayName && typeof place.displayName.text === 'string') return place.displayName.text;
  if (typeof place.name === 'string') return place.name;
  return 'Searched Place';
}

function safeStringAddress(place: any): string {
  if (!place) return '';
  if (typeof place.formattedAddress === 'string') return place.formattedAddress;
  if (typeof place.formatted_address === 'string') return place.formatted_address;
  if (typeof place.vicinity === 'string') return place.vicinity;
  return '';
}

// Subcomponent: Leaflet / OpenStreetMap Interactive Engine
function LeafletMapView({
  userLocation,
  destinationCoords,
  selectedMode,
  selectedRouteType,
  pois,
  safetyZones,
  sosActive,
  sosCoords,
  searchResults,
  panTarget,
  onSelectDestination
}: {
  userLocation: google.maps.LatLngLiteral;
  destinationCoords: google.maps.LatLngLiteral | null;
  selectedMode: 'WALKING' | 'DRIVING' | 'BICYCLING' | 'TRANSIT';
  selectedRouteType: 'safest' | 'fastest' | 'cheapest';
  pois: SmartPOI[];
  safetyZones: SafetyZone[];
  sosActive: boolean;
  sosCoords: google.maps.LatLngLiteral;
  searchResults: any[];
  panTarget: google.maps.LatLngLiteral | null;
  onSelectDestination?: (coords: google.maps.LatLngLiteral) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distance: string; duration: string } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (!mapRef.current) {
      if ((containerRef.current as any)._leaflet_id) {
        delete (containerRef.current as any)._leaflet_id;
      }

      const map = L.map(containerRef.current, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 13,
        zoomControl: true,
        attributionControl: true
      });

      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
        subdomains: 'abcd',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
      }).addTo(map);

      layersRef.current = L.layerGroup().addTo(map);
      mapRef.current = map;

      setTimeout(() => map.invalidateSize(), 50);
      setTimeout(() => map.invalidateSize(), 200);
      setTimeout(() => map.invalidateSize(), 500);
    }

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layersRef.current = null;
        routeLayerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (mapRef.current && panTarget && typeof panTarget.lat === 'number' && typeof panTarget.lng === 'number') {
      try {
        mapRef.current.setView([panTarget.lat, panTarget.lng], 14, { animate: true });
        mapRef.current.invalidateSize();
      } catch (e) {
        console.warn("Leaflet pan error:", e);
      }
    }
  }, [panTarget]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (routeLayerRef.current) {
      map.removeLayer(routeLayerRef.current);
      routeLayerRef.current = null;
    }

    if (!destinationCoords) {
      setRouteInfo(null);
      return;
    }

    const startLng = userLocation.lng;
    const startLat = userLocation.lat;
    const endLng = destinationCoords.lng;
    const endLat = destinationCoords.lat;

    const osrmProfile =
      selectedMode === 'WALKING'
        ? 'foot'
        : selectedMode === 'BICYCLING'
          ? 'bike'
          : 'driving';
    const routeColor =
      selectedRouteType === 'safest'
        ? '#10b981'
        : selectedRouteType === 'cheapest'
          ? '#6366f1'
          : '#3b82f6';

    const controller = new AbortController();

    fetch(`https://router.project-osrm.org/route/v1/${osrmProfile}/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson`, {
      signal: controller.signal
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          const coordinates: [number, number][] = route.geometry.coordinates.map((c: [number, number]) => [c[1], c[0]]);

          const polyline = L.polyline(coordinates, {
            color: routeColor,
            weight: 5,
            opacity: 0.9,
            dashArray: selectedRouteType === 'cheapest' ? '8, 6' : undefined,
            lineJoin: 'round'
          }).addTo(map);

          routeLayerRef.current = polyline;

          const distKm = (route.distance / 1000).toFixed(1);
          const speedAdjust = selectedMode === 'WALKING' ? 2.5 : selectedMode === 'BICYCLING' ? 1.4 : 1;
          const durMin = Math.max(1, Math.ceil((route.duration / 60) * (osrmProfile === 'driving' && selectedMode === 'WALKING' ? speedAdjust : 1)));
          setRouteInfo({
            distance: `${distKm} km`,
            duration: `${durMin} mins (${selectedMode.toLowerCase()})`
          });

          try {
            map.fitBounds(polyline.getBounds(), { padding: [40, 40] });
          } catch {}
        } else {
          const polyline = L.polyline([[startLat, startLng], [endLat, endLng]], {
            color: routeColor,
            weight: 4,
            opacity: 0.85,
            dashArray: '6, 8'
          }).addTo(map);
          routeLayerRef.current = polyline;
        }
      })
      .catch(err => {
        if (err.name !== 'AbortError') {
          console.warn("OSRM routing fallback:", err);
          const polyline = L.polyline([[startLat, startLng], [endLat, endLng]], {
            color: routeColor,
            weight: 4,
            opacity: 0.85,
            dashArray: '6, 8'
          }).addTo(map);
          routeLayerRef.current = polyline;
        }
      });

    return () => {
      controller.abort();
    };
  }, [userLocation, destinationCoords, selectedMode, selectedRouteType]);

  useEffect(() => {
    const map = mapRef.current;
    const layers = layersRef.current;
    if (!map || !layers) return;

    layers.clearLayers();

    const makeDivIcon = (bgColor: string, symbol: string) => {
      return L.divIcon({
        className: 'custom-osm-marker',
        html: `<div style="background-color: ${bgColor}; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 2px solid white; box-shadow: 0 4px 14px rgba(0,0,0,0.4); font-size: 14px; font-family: sans-serif; font-weight: bold; cursor: pointer;">${symbol}</div>`,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
    };

    const userM = L.marker([userLocation.lat, userLocation.lng], {
      icon: L.divIcon({
        className: 'user-osm-marker',
        html: `<div style="background-color: #2563eb; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; border: 3px solid white; box-shadow: 0 0 20px rgba(37,99,235,0.9); font-size: 16px;">🚶</div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17]
      })
    }).bindPopup(`
      <div style="font-family: inherit; padding: 4px; min-width: 140px;">
        <div style="font-weight: 800; font-size: 13px; color: #38bdf8; display: flex; align-items: center; gap: 4px;">
          📍 Current GPS Location
        </div>
        <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">
          Lat: ${userLocation.lat.toFixed(4)}, Lng: ${userLocation.lng.toFixed(4)}
        </div>
      </div>
    `);
    layers.addLayer(userM);

    if (destinationCoords) {
      const destM = L.marker([destinationCoords.lat, destinationCoords.lng], {
        icon: makeDivIcon('#ea580c', '🏁')
      }).bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 140px;">
          <div style="font-weight: 800; font-size: 13px; color: #fb923c;">🏁 Target Destination</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">Selected for navigation</div>
        </div>
      `);
      layers.addLayer(destM);
    }

    searchResults.forEach((res) => {
      const loc = res.location;
      if (!loc) return;
      const lat = typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat);
      const lng = typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng);
      if (isNaN(lat) || isNaN(lng)) return;

      const nameStr = safeStringTitle(res);
      const addrStr = safeStringAddress(res);

      const m = L.marker([lat, lng], {
        icon: makeDivIcon('#f59e0b', '🔍')
      }).bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 160px;">
          <div style="font-weight: bold; font-size: 13px; color: #f8fafc;">${nameStr}</div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 2px;">${addrStr}</div>
        </div>
      `);

      m.on('click', () => {
        if (onSelectDestination) {
          onSelectDestination({ lat, lng });
        }
      });

      layers.addLayer(m);
    });

    pois.forEach(poi => {
      let col = '#3b82f6';
      let sym = '📍';
      if (poi.category === 'hospital') { col = '#ef4444'; sym = '🏥'; }
      if (poi.category === 'police') { col = '#06b6d4'; sym = '👮'; }
      if (poi.category === 'hotel') { col = '#8b5cf6'; sym = '🏨'; }
      if (poi.category === 'transit') { col = '#10b981'; sym = '🚆'; }

      const m = L.marker([poi.lat, poi.lng], {
        icon: makeDivIcon(col, sym)
      }).bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 160px;">
          <div style="display: inline-block; padding: 2px 6px; border-radius: 4px; background: rgba(59, 130, 246, 0.2); color: #60a5fa; font-size: 9px; font-weight: 800; text-transform: uppercase;">
            ${poi.category}
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #f8fafc; margin-top: 4px;">${poi.name}</div>
          <div style="font-size: 11px; font-weight: bold; color: #34d399; margin-top: 2px;">
            Safety Rating: ${poi.safetyRating}/10
          </div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 4px;">${poi.details || ''}</div>
        </div>
      `);
      layers.addLayer(m);
    });

    safetyZones.forEach(zone => {
      const color = zone.type === 'safe' ? '#10b981' : zone.type === 'moderate' ? '#f59e0b' : '#ef4444';
      const circle = L.circle([zone.lat, zone.lng], {
        color: color,
        fillColor: color,
        fillOpacity: 0.18,
        radius: 700
      });
      layers.addLayer(circle);

      const m = L.marker([zone.lat, zone.lng], {
        icon: makeDivIcon(color, zone.type === 'safe' ? '🛡️' : '⚠️')
      }).bindPopup(`
        <div style="font-family: inherit; padding: 4px; min-width: 160px;">
          <div style="font-weight: 800; font-size: 13px; color: #f8fafc;">${zone.name}</div>
          <div style="font-size: 11px; font-weight: 700; color: ${color}; margin-top: 2px;">
            ${zone.type.toUpperCase()} • Crime Index: ${zone.crimeIndex}
          </div>
          <div style="font-size: 11px; color: #94a3b8; margin-top: 4px;">${zone.description}</div>
        </div>
      `);
      layers.addLayer(m);
    });

    if (sosActive) {
      const sosM = L.marker([sosCoords.lat, sosCoords.lng], {
        icon: makeDivIcon('#ef4444', '🚨')
      }).bindPopup(`
        <div style="font-family: inherit; padding: 4px;">
          <div style="font-weight: 800; color: #f87171; font-size: 13px;">🚨 Emergency SOS Signal Active!</div>
          <div style="font-size: 11px; color: #cbd5e1; margin-top: 2px;">Broadcasting coordinates to local responders.</div>
        </div>
      `);
      layers.addLayer(sosM);
    }
  }, [userLocation, destinationCoords, pois, safetyZones, sosActive, sosCoords, searchResults, onSelectDestination]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-[24px] overflow-hidden">
      <div ref={containerRef} className="w-full h-full min-h-[500px] rounded-[24px] shadow-inner" />

      {routeInfo && (
        <div className="absolute top-4 right-4 z-[500] flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-blue-500/40 text-xs text-white shadow-xl">
          <div className="h-2.5 w-2.5 rounded-full bg-blue-500 animate-pulse" />
          <div className="flex flex-col">
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">OSRM Live Route</span>
            <span className="font-bold text-blue-400">{routeInfo.distance} • ~{routeInfo.duration}</span>
          </div>
        </div>
      )}
    </div>
  );
}

interface MapErrorBoundaryProps {
  children: React.ReactNode;
  onFallbackToOsm?: () => void;
}

interface MapErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// React Error Boundary to prevent map runtime crashes from turning screen blank
class MapErrorBoundary extends Component<MapErrorBoundaryProps, MapErrorBoundaryState> {
  constructor(props: MapErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): MapErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn("Map Error Boundary caught error, falling back to OpenStreetMap:", error, errorInfo);
    if (this.props.onFallbackToOsm) {
      this.props.onFallbackToOsm();
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-full min-h-[500px] rounded-3xl border border-blue-500/30 bg-slate-950 p-6 flex flex-col items-center justify-center text-center text-slate-200 space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-blue-500/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
            <Globe className="h-6 w-6" />
          </div>
          <h4 className="text-lg font-bold text-white">Interactive OpenStreetMap Engine Active</h4>
          <p className="text-xs text-slate-400 max-w-md leading-relaxed">
            The map stage seamlessly switched to the OpenStreetMap Leaflet engine with real-time GPS tracking and emergency safety layers.
          </p>
          <button
            onClick={() => {
              if (this.props.onFallbackToOsm) {
                this.props.onFallbackToOsm();
              }
              this.setState({ hasError: false, error: null });
            }}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-md"
          >
            Refresh Map
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Helper component to programmatically pan map
function MapPanController({ center }: { center: google.maps.LatLngLiteral | null }) {
  const map = useMap();
  useEffect(() => {
    if (map && center && typeof center.lat === 'number' && typeof center.lng === 'number') {
      try {
        map.panTo(center);
      } catch (e) {
        console.warn("panTo error:", e);
      }
    }
  }, [map, center]);
  return null;
}

// Subcomponent to compute and display real Google Maps Routes
function RouteDisplay({ 
  origin, 
  destination, 
  travelMode 
}: { 
  origin: google.maps.LatLngLiteral; 
  destination: google.maps.LatLngLiteral;
  travelMode: 'DRIVING' | 'WALKING' | 'BICYCLING' | 'TRANSIT';
}) {
  const map = useMap();
  const routesLib = useMapsLibrary('routes');
  const polylinesRef = useRef<google.maps.Polyline[]>([]);

  useEffect(() => {
    if (!routesLib || !map || !origin || !destination) return;

    // Clear existing polylines
    polylinesRef.current.forEach(p => p.setMap(null));
    polylinesRef.current = [];

    try {
      routesLib.Route.computeRoutes({
        origin,
        destination,
        travelMode,
        fields: ['path', 'distanceMeters', 'durationMillis', 'viewport'],
      }).then(({ routes }) => {
        if (routes && routes[0]) {
          const newPolylines = routes[0].createPolylines();
          newPolylines.forEach(p => {
            p.setOptions({
              strokeColor: '#2563EB',
              strokeWeight: 5,
              strokeOpacity: 0.85
            });
            p.setMap(map);
          });
          polylinesRef.current = newPolylines;

          if (routes[0].viewport) {
            map.fitBounds(routes[0].viewport);
          }
        }
      }).catch(err => {
        console.warn("Routes API computeRoutes info:", err);
      });
    } catch (err) {
      console.warn("Route calculation exception caught:", err);
    }

    return () => {
      polylinesRef.current.forEach(p => p.setMap(null));
      polylinesRef.current = [];
    };
  }, [routesLib, map, origin, destination, travelMode]);

  return null;
}

// Subcomponent to handle Google Places Search with multiple API fallbacks
function PlacesSearchHandler({
  query,
  onPlacesFound
}: {
  query: string;
  onPlacesFound: (places: any[]) => void;
}) {
  const placesLib = useMapsLibrary('places');
  const map = useMap();

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      onPlacesFound([]);
      return;
    }

    let isMounted = true;

    // Try searchByText (New Places API)
    if (placesLib?.Place && typeof placesLib.Place.searchByText === 'function') {
      placesLib.Place.searchByText({
        textQuery: query,
        fields: ['displayName', 'location', 'formattedAddress', 'rating', 'id'],
        locationBias: map?.getCenter(),
        maxResultCount: 8,
      }).then(({ places }) => {
        if (isMounted && places) {
          onPlacesFound(places);
        }
      }).catch(err => {
        console.warn("Places searchByText error, trying fallback:", err);
        if (map && (window as any).google?.maps?.places?.PlacesService) {
          try {
            const service = new (window as any).google.maps.places.PlacesService(map);
            service.textSearch({ query, location: map.getCenter() }, (results: any[]) => {
              if (isMounted && results) {
                const formatted = results.map(r => ({
                  id: r.place_id || Math.random().toString(),
                  displayName: r.name,
                  formattedAddress: r.formatted_address,
                  location: r.geometry?.location ? { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() } : null
                }));
                onPlacesFound(formatted.filter(f => f.location));
              }
            });
          } catch (e) {
            console.warn("PlacesService fallback failed:", e);
          }
        }
      });
    } else if (map && (window as any).google?.maps?.places?.PlacesService) {
      try {
        const service = new (window as any).google.maps.places.PlacesService(map);
        service.textSearch({ query, location: map.getCenter() }, (results: any[]) => {
          if (isMounted && results) {
            const formatted = results.map(r => ({
              id: r.place_id || Math.random().toString(),
              displayName: r.name,
              formattedAddress: r.formatted_address,
              location: r.geometry?.location ? { lat: r.geometry.location.lat(), lng: r.geometry.location.lng() } : null
            }));
            onPlacesFound(formatted.filter(f => f.location));
          }
        });
      } catch (e) {
        console.warn("PlacesService exception:", e);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [placesLib, query, map, onPlacesFound]);

  return null;
}

// Marker with InfoWindow anchor
function MarkerWithInfoWindow({
  position,
  title,
  subtitle,
  category,
  safetyScore,
  details,
  pinColor
}: {
  key?: string;
  position: google.maps.LatLngLiteral;
  title: string;
  subtitle?: string;
  category?: string;
  safetyScore?: number | string;
  details?: string;
  pinColor: string;
}) {
  const map = useMap();
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [isOpen, setIsOpen] = useState(false);

  // Guard against null map instance to prevent getRootNode crash
  if (!map) return null;

  const safeTitleStr = safeStringTitle({ displayName: title });
  const safeSubtitleStr = typeof subtitle === 'string' ? subtitle : '';
  const safeDetailsStr = typeof details === 'string' ? details : '';

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={position}
        onClick={() => setIsOpen(!isOpen)}
        title={safeTitleStr}
      >
        <Pin background={pinColor} glyphColor="#ffffff" borderColor="#ffffff" />
      </AdvancedMarker>

      {isOpen && marker && (
        <InfoWindow anchor={marker} onCloseClick={() => setIsOpen(false)}>
          <div className="p-2 max-w-xs font-sans text-slate-800">
            {category && (
              <span className="inline-block rounded bg-blue-100 text-blue-800 px-1.5 py-0.5 text-[9px] font-bold uppercase mb-1">
                {category}
              </span>
            )}
            <h4 className="font-bold text-sm text-slate-900 leading-tight">{safeTitleStr}</h4>
            {safeSubtitleStr && <p className="text-xs text-slate-500 mt-0.5">{safeSubtitleStr}</p>}
            {safetyScore && (
              <div className="mt-1.5 flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 p-1 rounded">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Safety Rating: {safetyScore}/10</span>
              </div>
            )}
            {safeDetailsStr && <p className="text-xs text-slate-600 mt-1.5 border-t border-slate-100 pt-1">{safeDetailsStr}</p>}
          </div>
        </InfoWindow>
      )}
    </>
  );
}

// Inner layer to ensure AdvancedMarker and Map libraries are only rendered after Map is mounted
interface GoogleMapLayersProps {
  userLocation: google.maps.LatLngLiteral;
  panTarget: google.maps.LatLngLiteral | null;
  searchTerm: string;
  setSearchResults: (places: any[]) => void;
  destinationCoords: google.maps.LatLngLiteral | null;
  selectedMode: 'WALKING' | 'DRIVING' | 'BICYCLING' | 'TRANSIT';
  searchResults: any[];
  filteredPois: SmartPOI[];
  safetyZones: SafetyZone[];
  sosActive: boolean;
  sosCoords: google.maps.LatLngLiteral;
}

function GoogleMapLayers({
  userLocation,
  panTarget,
  searchTerm,
  setSearchResults,
  destinationCoords,
  selectedMode,
  searchResults,
  filteredPois,
  safetyZones,
  sosActive,
  sosCoords,
}: GoogleMapLayersProps) {
  const map = useMap();

  // Guard against null map or unmounted instance to prevent <AdvancedMarker> getRootNode crash
  if (!map) {
    return null;
  }

  return (
    <>
      <MapPanController center={panTarget} />

      {/* Places Search Handler */}
      <PlacesSearchHandler query={searchTerm} onPlacesFound={setSearchResults} />

      {/* Real Compute Route Handler */}
      {destinationCoords && (
        <RouteDisplay 
          origin={userLocation}
          destination={destinationCoords}
          travelMode={selectedMode}
        />
      )}

      {/* User Current Position Marker */}
      <AdvancedMarker position={userLocation} title="Your GPS Location">
        <Pin background="#2563EB" glyphColor="#ffffff" borderColor="#1E40AF" />
      </AdvancedMarker>

      {/* Real Google Places Search Markers */}
      {searchResults.map((place, idx) => {
        const loc = place.location;
        if (!loc) return null;
        const pos: google.maps.LatLngLiteral = {
          lat: typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat),
          lng: typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng)
        };
        const nameStr = safeStringTitle(place);
        const addrStr = safeStringAddress(place);
        return (
          <MarkerWithInfoWindow
            key={place.id ? String(place.id) : `search-marker-${idx}`}
            position={pos}
            title={nameStr}
            subtitle={addrStr}
            pinColor="#EA580C"
          />
        );
      })}

      {/* POI Markers */}
      {filteredPois.map((poi) => {
        let col = '#3B82F6';
        if (poi.category === 'hospital') col = '#EF4444';
        if (poi.category === 'police') col = '#06B6D4';
        if (poi.category === 'hotel') col = '#8B5CF6';
        if (poi.category === 'transit') col = '#10B981';

        return (
          <MarkerWithInfoWindow
            key={poi.id}
            position={{ lat: poi.lat, lng: poi.lng }}
            title={poi.name}
            category={poi.category}
            safetyScore={poi.safetyRating}
            details={poi.details}
            pinColor={col}
          />
        );
      })}

      {/* Safety Zones Markers */}
      {safetyZones.map((zone) => (
        <MarkerWithInfoWindow
          key={zone.id}
          position={{ lat: zone.lat, lng: zone.lng }}
          title={zone.name}
          subtitle={`Crime Index: ${zone.crimeIndex}`}
          safetyScore={zone.type === 'safe' ? '9.8' : zone.type === 'moderate' ? '7.0' : '4.2'}
          details={zone.description}
          pinColor={zone.type === 'safe' ? '#10B981' : zone.type === 'moderate' ? '#F59E0B' : '#EF4444'}
        />
      ))}

      {/* SOS Active Beacon Marker */}
      {sosActive && (
        <AdvancedMarker position={sosCoords} title="🚨 Emergency SOS Signal Active">
          <div className="relative flex items-center justify-center">
            <div className="absolute h-10 w-10 animate-ping rounded-full bg-red-500 opacity-75" />
            <Pin background="#EF4444" glyphColor="#ffffff" borderColor="#991B1B" />
          </div>
        </AdvancedMarker>
      )}
    </>
  );
}

export default function MapComponent({ safetyZones, pois, sosActive, sosCoords, userCoords, focusCoords }: MapComponentProps) {
  const isKeyValid = isValidGoogleMapsKey(RAW_KEY);
  const [authFailed, setAuthFailed] = useState<boolean>(false);
  const [engineMode, setEngineMode] = useState<'osm' | 'google'>(isKeyValid ? 'google' : 'osm');

  const [selectedMode, setSelectedMode] = useState<'WALKING' | 'DRIVING' | 'BICYCLING' | 'TRANSIT'>('WALKING');
  const [selectedRouteType, setSelectedRouteType] = useState<'safest' | 'fastest' | 'cheapest'>('safest');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeFilters, setActiveFilters] = useState<string[]>(['hotel', 'hospital', 'police', 'transit', 'atm']);
  const [userLocation, setUserLocation] = useState<google.maps.LatLngLiteral>(
    userCoords || { lat: 26.9124, lng: 75.7873 }
  );
  const [destinationCoords, setDestinationCoords] = useState<google.maps.LatLngLiteral | null>(
    focusCoords || { lat: 26.9239, lng: 75.8267 }
  );
  const [panTarget, setPanTarget] = useState<google.maps.LatLngLiteral | null>(focusCoords || null);

  useEffect(() => {
    if (userCoords?.lat && userCoords?.lng) {
      setUserLocation(userCoords);
    }
  }, [userCoords?.lat, userCoords?.lng]);

  useEffect(() => {
    if (focusCoords?.lat && focusCoords?.lng) {
      setDestinationCoords(focusCoords);
      setPanTarget(focusCoords);
    }
  }, [focusCoords?.lat, focusCoords?.lng]);

  // Detect Google Maps Authentication Failure and automatically fallback to OpenStreetMap
  useEffect(() => {
    (window as any).gm_authFailure = () => {
      console.warn("Google Maps authentication failure. Automatically switching map engine to OpenStreetMap.");
      setAuthFailed(true);
      setEngineMode('osm');
    };
  }, []);

  // Try fetching real geolocation on mount if no explicit userCoords passed
  useEffect(() => {
    if (!userCoords && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          setUserLocation(loc);
        },
        () => {},
        { timeout: 5000 }
      );
    }
  }, []);

  // OpenStreetMap Nominatim Search effect when in OSM mode
  useEffect(() => {
    if (!searchTerm || searchTerm.trim().length < 2) {
      if (engineMode === 'osm' || authFailed) setSearchResults([]);
      return;
    }

    if (engineMode === 'osm' || authFailed || !isKeyValid) {
      const controller = new AbortController();
      const timer = setTimeout(() => {
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}`, {
          signal: controller.signal
        })
          .then(res => res.json())
          .then(data => {
            if (Array.isArray(data)) {
              const formatted = data.map(item => ({
                id: item.place_id ? String(item.place_id) : Math.random().toString(),
                displayName: item.display_name.split(',')[0],
                formattedAddress: item.display_name,
                location: { lat: parseFloat(item.lat), lng: parseFloat(item.lon) }
              }));
              setSearchResults(formatted);
            }
          })
          .catch(err => {
            if (err.name !== 'AbortError') console.warn("Nominatim search error:", err);
          });
      }, 300);

      return () => {
        clearTimeout(timer);
        controller.abort();
      };
    }
  }, [searchTerm, engineMode, authFailed, isKeyValid]);

  const toggleFilter = (category: string) => {
    setActiveFilters(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const filteredPois = pois.filter(poi => activeFilters.includes(poi.category));

  return (
    <div className="flex flex-col space-y-6" id="google-map-main-wrapper">
      {/* Main Controls + Map Layout Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        
        {/* Sidebar Controls */}
        <div className="flex flex-col space-y-4 lg:col-span-1">
          
          {/* Destination & Transport Mode */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
                <Compass className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                Live Navigator
              </h4>
              <span className="rounded bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                {engineMode === 'google' && !authFailed ? 'Google Maps API' : 'OpenStreetMap'}
              </span>
            </div>

            <div className="relative">
              <input
                type="text"
                placeholder="Search places or landmarks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 py-2.5 pl-9 pr-4 text-xs focus:border-blue-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-none font-medium text-slate-800 dark:text-slate-100"
              />
              <Search className="absolute top-3 left-3 h-4 w-4 text-slate-400" />
            </div>

            {/* Live Search Results List */}
            {searchResults.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-xs">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1">Found Places</div>
                {searchResults.map((place, idx) => {
                  const loc = place.location;
                  const pos: google.maps.LatLngLiteral | null = loc ? {
                    lat: typeof loc.lat === 'function' ? loc.lat() : Number(loc.lat),
                    lng: typeof loc.lng === 'function' ? loc.lng() : Number(loc.lng)
                  } : null;
                  const name = safeStringTitle(place);
                  const addr = safeStringAddress(place);
                  return (
                    <button
                      key={place.id ? String(place.id) : `search-res-${idx}`}
                      type="button"
                      onClick={() => {
                        if (pos) {
                          setDestinationCoords(pos);
                          setPanTarget(pos);
                        }
                      }}
                      className="w-full text-left p-1.5 rounded-lg hover:bg-blue-100/60 dark:hover:bg-blue-950/60 transition-all flex flex-col group"
                    >
                      <span className="font-bold text-slate-800 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-blue-400">{name}</span>
                      {addr && <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{addr}</span>}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Travel Mode Pills */}
            <div className="grid grid-cols-4 gap-1.5">
              {[
                { id: 'WALKING', label: 'Walk' },
                { id: 'DRIVING', label: 'Drive' },
                { id: 'BICYCLING', label: 'Cycle' },
                { id: 'TRANSIT', label: 'Transit' }
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMode(m.id as any)}
                  className={`rounded-lg py-1.5 text-[10px] font-bold transition-all ${
                    selectedMode === m.id 
                      ? 'bg-blue-600 text-white shadow' 
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* AI Route Strategy */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Route Strategy</h4>
            <div className="space-y-1.5">
              {[
                { id: 'safest', title: 'Safest Route', score: '9.8', desc: 'Monitored boulevards & high lighting' },
                { id: 'fastest', title: 'Fastest Route', score: '7.5', desc: 'Direct expressway route' },
                { id: 'cheapest', title: 'Transit Route', score: '8.2', desc: 'Public metro lines' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedRouteType(r.id as any)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    selectedRouteType === r.id 
                      ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-bold shadow-xs' 
                      : 'border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span>{r.title}</span>
                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-1.5 py-0.5 rounded">
                      Safe: {r.score}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">{r.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* POI Layer Filters */}
          <div className="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 flex items-center gap-1">
              <Sliders className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
              Safety Infrastructure Layers
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'hotel', label: '🏨 Hotels' },
                { id: 'hospital', label: '🏥 Hospitals' },
                { id: 'police', label: '🚨 Police' },
                { id: 'transit', label: '🚇 Metro' },
                { id: 'atm', label: '💵 ATMs' }
              ].map((f) => {
                const active = activeFilters.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => toggleFilter(f.id)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-semibold transition-all ${
                      active 
                        ? 'bg-blue-600 text-white font-bold shadow-xs' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Map Canvas Container */}
        <div className="lg:col-span-3 rounded-3xl border border-slate-200 overflow-hidden shadow-lg bg-slate-900 flex flex-col min-h-[550px] relative">
          
          {/* Map Status Bar HUD */}
          <div className="bg-slate-950/90 text-white px-4 py-2.5 flex items-center justify-between border-b border-slate-800 text-xs z-10 flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <span className={`h-2.5 w-2.5 rounded-full ${engineMode === 'google' && isKeyValid && !authFailed ? 'bg-emerald-500 animate-pulse' : 'bg-cyan-400 animate-pulse'}`} />
              <span className="font-mono text-xs text-slate-300">
                {engineMode === 'google' && isKeyValid && !authFailed ? 'GOOGLE MAPS PLATFORM LIVE' : 'OPENSTREETMAP (LEAFLET ACTIVE)'}
              </span>
            </div>

            {/* Engine Switcher Controls */}
            <div className="flex items-center space-x-2">
              <div className="flex bg-slate-800/80 p-0.5 rounded-lg border border-slate-700">
                <button
                  type="button"
                  onClick={() => setEngineMode('osm')}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    engineMode === 'osm' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Globe className="h-3 w-3" />
                  <span>OpenStreetMap</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isKeyValid && !authFailed) {
                      setEngineMode('google');
                    } else {
                      setEngineMode('osm');
                    }
                  }}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    engineMode === 'google' && isKeyValid && !authFailed ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <MapIcon className="h-3 w-3" />
                  <span>Google Maps</span>
                </button>
              </div>

              <button
                onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                      (pos) => {
                        const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                        setUserLocation(loc);
                        setPanTarget(loc);
                      },
                      () => {}
                    );
                  }
                }}
                className="flex items-center gap-1 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-200 hover:bg-slate-700 border border-slate-700"
              >
                <LocateFixed className="h-3.5 w-3.5 text-cyan-400" />
                <span>Locate Me</span>
              </button>
            </div>
          </div>

          {/* Interactive Map Stage */}
          <div className="flex-1 w-full h-[500px] relative" style={{ height: '520px' }}>
            <MapErrorBoundary onFallbackToOsm={() => { setAuthFailed(true); setEngineMode('osm'); }}>
              {engineMode === 'google' && isKeyValid && !authFailed ? (
                <APIProvider 
                  apiKey={RAW_KEY.trim()} 
                  version="weekly"
                  onError={(err) => {
                    console.warn("Google Maps APIProvider initialization failed:", err);
                    setAuthFailed(true);
                    setEngineMode('osm');
                  }}
                >
                  <Map
                    defaultCenter={userLocation}
                    defaultZoom={13}
                    mapId="DEMO_MAP_ID"
                    internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                    style={{ width: '100%', height: '100%' }}
                  >
                    <GoogleMapLayers
                      userLocation={userLocation}
                      panTarget={panTarget}
                      searchTerm={searchTerm}
                      setSearchResults={setSearchResults}
                      destinationCoords={destinationCoords}
                      selectedMode={selectedMode}
                      searchResults={searchResults}
                      filteredPois={filteredPois}
                      safetyZones={safetyZones}
                      sosActive={sosActive}
                      sosCoords={sosCoords}
                    />
                  </Map>
                </APIProvider>
              ) : (
                /* Interactive OpenStreetMap (Leaflet) Engine */
                <LeafletMapView
                  userLocation={userLocation}
                  destinationCoords={destinationCoords}
                  selectedMode={selectedMode}
                  selectedRouteType={selectedRouteType}
                  pois={filteredPois}
                  safetyZones={safetyZones}
                  sosActive={sosActive}
                  sosCoords={sosCoords}
                  searchResults={searchResults}
                  panTarget={panTarget}
                  onSelectDestination={(coords) => {
                    setDestinationCoords(coords);
                    setPanTarget(coords);
                  }}
                />
              )}
            </MapErrorBoundary>
          </div>

          {/* Map Footer Legend */}
          <div className="bg-slate-950 px-4 py-2.5 text-xs text-slate-400 flex justify-between items-center border-t border-slate-800 flex-wrap gap-2">
            <div className="flex items-center space-x-3 text-[11px]">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> User GPS</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /> Safe (9-10)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Moderate (6-8)</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /> Hazard (1-5)</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">
              {engineMode === 'google' && isKeyValid && !authFailed ? 'SafeTour Google Maps SDK v3' : 'SafeTour OpenStreetMap Engine'}
            </span>
          </div>

        </div>

      </div>

    </div>
  );
}
