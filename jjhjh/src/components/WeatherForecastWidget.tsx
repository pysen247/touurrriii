/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Sun,
  Cloud,
  CloudSun,
  CloudRain,
  CloudLightning,
  CloudFog,
  Snowflake,
  Wind,
  Droplets,
  Sunrise,
  Sunset,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Umbrella
} from 'lucide-react';

export interface DailyForecastItem {
  date: string;
  dayName: string;
  dateLabel: string;
  weatherCode: number;
  condition: string;
  iconKey: string;
  tempMax: number;
  tempMin: number;
  precipProb: number;
  uvMax: number;
  windMax: number;
  sunrise: string;
  sunset: string;
  riskLevel: 'Optimal' | 'Caution' | 'Alert';
  outdoorAdvisory: string;
}

export interface WeatherForecastPayload {
  source: string;
  location: string;
  coords: { lat: number; lng: number };
  updatedAt: string;
  current: {
    temperature: number;
    feelsLike: number;
    condition: string;
    iconKey: string;
    humidity: number;
    windSpeedKmH: number;
    uvIndex: number;
    airQualityIndex: number;
    aqiCategory: string;
    pm25?: number;
    heatWarning: string;
    safetyImpact: string;
  };
  forecast: DailyForecastItem[];
}

interface WeatherForecastWidgetProps {
  userCoords: { lat: number; lng: number };
  activeTripDestination?: string;
  language?: string;
}

const DESTINATION_COORDS_LOOKUP: Record<string, { lat: number; lng: number; label: string }> = {
  jaipur: { lat: 26.9124, lng: 75.7873, label: 'Jaipur, IN' },
  agra: { lat: 27.1751, lng: 78.0421, label: 'Agra, IN' },
  delhi: { lat: 28.6139, lng: 77.209, label: 'New Delhi, IN' },
  mumbai: { lat: 19.076, lng: 72.8777, label: 'Mumbai, IN' },
  varanasi: { lat: 25.3176, lng: 82.9739, label: 'Varanasi, IN' },
  goa: { lat: 15.2993, lng: 74.124, label: 'Goa, IN' },
  udaipur: { lat: 24.5854, lng: 73.7125, label: 'Udaipur, IN' },
  amritsar: { lat: 31.634, lng: 74.8723, label: 'Amritsar, IN' },
  kerala: { lat: 9.4981, lng: 76.3388, label: 'Alleppey, IN' },
  alleppey: { lat: 9.4981, lng: 76.3388, label: 'Alleppey, IN' },
  lonavala: { lat: 18.7546, lng: 73.4062, label: 'Lonavala, IN' },
  ladakh: { lat: 34.1526, lng: 77.5771, label: 'Leh Ladakh, IN' },
  shimla: { lat: 31.1048, lng: 77.1734, label: 'Shimla, IN' },
  manali: { lat: 32.2432, lng: 77.1892, label: 'Manali, IN' },
  rishikesh: { lat: 30.0869, lng: 78.2676, label: 'Rishikesh, IN' },
  paris: { lat: 48.8566, lng: 2.3522, label: 'Paris, FR' },
  tokyo: { lat: 35.6762, lng: 139.6503, label: 'Tokyo, JP' },
  dubai: { lat: 25.2048, lng: 55.2708, label: 'Dubai, AE' },
  london: { lat: 51.5072, lng: -0.1276, label: 'London, UK' },
  rome: { lat: 41.9028, lng: 12.4964, label: 'Rome, IT' },
  singapore: { lat: 1.3521, lng: 103.8198, label: 'Singapore, SG' },
  'new york': { lat: 40.7128, lng: -74.006, label: 'New York, US' }
};

function resolveDestinationCoords(destination?: string): { lat: number; lng: number; label: string } | null {
  if (!destination) return null;
  const lower = destination.toLowerCase();
  for (const [key, val] of Object.entries(DESTINATION_COORDS_LOOKUP)) {
    if (lower.includes(key)) {
      return val;
    }
  }
  return null;
}

export function WeatherGlyph({ iconKey, className = 'h-5 w-5' }: { iconKey: string; className?: string }) {
  switch (iconKey) {
    case 'sun':
      return <Sun className={`${className} text-amber-500`} />;
    case 'cloud-sun':
      return <CloudSun className={`${className} text-amber-400`} />;
    case 'cloud':
      return <Cloud className={`${className} text-slate-400`} />;
    case 'fog':
      return <CloudFog className={`${className} text-slate-400`} />;
    case 'rain':
    case 'heavy-rain':
      return <CloudRain className={`${className} text-blue-500`} />;
    case 'storm':
      return <CloudLightning className={`${className} text-indigo-500`} />;
    case 'snow':
      return <Snowflake className={`${className} text-cyan-400`} />;
    default:
      return <CloudSun className={`${className} text-amber-400`} />;
  }
}

export default function WeatherForecastWidget({
  userCoords,
  activeTripDestination,
  language = 'en'
}: WeatherForecastWidgetProps) {
  const isHindi = language === 'hi';
  const resolvedTrip = resolveDestinationCoords(activeTripDestination);

  const [targetScope, setTargetScope] = useState<'gps' | 'trip'>('gps');
  const [weather, setWeather] = useState<WeatherForecastPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);

  const activeCoords =
    targetScope === 'trip' && resolvedTrip
      ? { lat: resolvedTrip.lat, lng: resolvedTrip.lng, label: resolvedTrip.label }
      : {
          lat: userCoords.lat || 26.9124,
          lng: userCoords.lng || 75.7873,
          label: `GPS ${Number(userCoords.lat || 26.9124).toFixed(2)}°N, ${Number(userCoords.lng || 75.7873).toFixed(2)}°E`
        };

  const fetchForecast = useCallback(async () => {
    const cacheKey = `safetour_weather_${activeCoords.lat.toFixed(2)}_${activeCoords.lng.toFixed(2)}`;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/weather/forecast?lat=${encodeURIComponent(activeCoords.lat)}&lng=${encodeURIComponent(activeCoords.lng)}&location=${encodeURIComponent(activeCoords.label)}`
      );
      if (res.ok) {
        const data: WeatherForecastPayload = await res.json();
        setWeather(data);
        setSelectedDayIdx(0);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(data));
        } catch {}
        setLoading(false);
        return;
      }
    } catch {
      // Fallback to localStorage offline snapshot
    }

    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setWeather(JSON.parse(cached));
      }
    } catch {}
    setLoading(false);
  }, [activeCoords.lat, activeCoords.lng, activeCoords.label]);

  useEffect(() => {
    fetchForecast();
  }, [fetchForecast]);

  const selectedDay = weather?.forecast?.[selectedDayIdx] || weather?.forecast?.[0];

  const getUvSeverity = (uv: number) => {
    if (uv >= 8) return { label: isHindi ? 'अत्यधिक' : 'Very High', cls: 'text-rose-600 dark:text-rose-400' };
    if (uv >= 6) return { label: isHindi ? 'उच्च' : 'High', cls: 'text-amber-600 dark:text-amber-400' };
    if (uv >= 3) return { label: isHindi ? 'मध्यम' : 'Moderate', cls: 'text-amber-500 dark:text-amber-400' };
    return { label: isHindi ? 'कम' : 'Low', cls: 'text-emerald-600 dark:text-emerald-400' };
  };

  const uvInfo = getUvSeverity(weather?.current?.uvIndex ?? 5);

  return (
    <section
      id="dashboard-weather-forecast-widget"
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 shadow-sm space-y-4"
    >
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {isHindi ? 'लाइव मौसम एवं 5-दिवसीय आउटडोर पूर्वानुमान' : 'Outdoor Travel Weather & 5-Day Forecast'}
          </h3>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 font-medium">
            <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
            <span className="truncate max-w-[190px]">{weather?.location || activeCoords.label}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
              {weather?.source === 'open-meteo' ? 'Live' : 'Offline Cache'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {resolvedTrip && (
            <div className="flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-0.5 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTargetScope('gps')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  targetScope === 'gps'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                GPS
              </button>
              <button
                type="button"
                onClick={() => setTargetScope('trip')}
                className={`px-2 py-1 rounded-md transition-colors cursor-pointer ${
                  targetScope === 'trip'
                    ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                Trip
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={fetchForecast}
            disabled={loading}
            title="Refresh live weather forecast"
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Current Conditions Hero */}
      {loading && !weather ? (
        <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
          Loading live meteorological telemetry...
        </div>
      ) : weather ? (
        <>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-center shrink-0">
                <WeatherGlyph iconKey={weather.current.iconKey} className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                    {weather.current.temperature}°C
                  </span>
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {weather.current.condition}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums mt-0.5">
                  Feels {weather.current.feelsLike}°C · Heat: <span className={weather.current.heatWarning === 'None Active' ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-amber-600 dark:text-amber-400 font-semibold'}>{weather.current.heatWarning}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Compact Metric Strip */}
          <div className="grid grid-cols-4 gap-2 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5 text-center">
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <Droplets className="h-3 w-3 text-blue-500" />
                <span>Humidity</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                {weather.current.humidity}%
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-center gap-1">
                <Wind className="h-3 w-3 text-cyan-500" />
                <span>Wind</span>
              </div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                {weather.current.windSpeedKmH} km/h
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">UV Index</div>
              <div className={`text-xs font-bold tabular-nums mt-0.5 ${uvInfo.cls}`}>
                {weather.current.uvIndex} · {uvInfo.label}
              </div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">AQI</div>
              <div className="text-xs font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                {weather.current.airQualityIndex} ({weather.current.aqiCategory})
              </div>
            </div>
          </div>

          {/* 5-Day Outdoor Forecast List */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-0.5">
              <span>{isHindi ? '5-दिवसीय यात्रा पूर्वानुमान' : '5-Day Preparedness Outlook'}</span>
              <span>{isHindi ? 'बारिश · हवा · तापमान' : 'Rain · Max/Min'}</span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60">
              {weather.forecast.map((day, idx) => {
                const isSelected = idx === selectedDayIdx;
                const dotClass =
                  day.riskLevel === 'Alert'
                    ? 'bg-rose-500'
                    : day.riskLevel === 'Caution'
                      ? 'bg-amber-500'
                      : 'bg-emerald-500';
                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={() => setSelectedDayIdx(idx)}
                    className={`w-full flex items-center justify-between gap-2 px-3 py-2 text-left transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl ${
                      isSelected
                        ? 'bg-blue-50/90 dark:bg-blue-950/40'
                        : 'hover:bg-white dark:hover:bg-slate-900/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className={`h-2 w-2 rounded-full shrink-0 ${dotClass}`} title={day.riskLevel} />
                      <div className="w-16 shrink-0">
                        <div className={`text-xs font-bold leading-tight ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-800 dark:text-slate-100'}`}>
                          {day.dayName}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500">{day.dateLabel}</div>
                      </div>
                      <WeatherGlyph iconKey={day.iconKey} className="h-4 w-4 shrink-0" />
                      <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 truncate">
                        {day.condition}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 tabular-nums text-xs">
                      <span className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold flex items-center gap-0.5">
                        <Umbrella className="h-3 w-3" />
                        {day.precipProb}%
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white w-14 text-right">
                        {day.tempMax}° <span className="font-normal text-slate-400 dark:text-slate-500">/ {day.tempMin}°</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Day Outdoor Travel Preparedness Advisory */}
          {selectedDay && (
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 space-y-2 text-xs">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-100">
                  {selectedDay.riskLevel === 'Optimal' ? (
                    <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <ShieldAlert className="h-4 w-4 text-amber-500 shrink-0" />
                  )}
                  <span>{selectedDay.dayName} ({selectedDay.dateLabel}) · {selectedDay.riskLevel}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                  <span className="flex items-center gap-0.5"><Sunrise className="h-3 w-3 text-amber-400" /> {selectedDay.sunrise}</span>
                  <span className="flex items-center gap-0.5"><Sunset className="h-3 w-3 text-orange-400" /> {selectedDay.sunset}</span>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                {selectedDay.outdoorAdvisory}
              </p>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 tabular-nums flex items-center gap-2 pt-0.5">
                <span>Wind max {selectedDay.windMax} km/h</span>
                <span>·</span>
                <span>Peak UV {selectedDay.uvMax}</span>
                <span>·</span>
                <span>Rain chance {selectedDay.precipProb}%</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="py-6 text-center text-xs text-slate-400">
          Weather telemetry unavailable. Tap refresh to retry.
        </div>
      )}
    </section>
  );
}
