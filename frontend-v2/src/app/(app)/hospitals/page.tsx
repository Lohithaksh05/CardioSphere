"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Phone,
  Globe,
  Navigation,
  AlertTriangle,
  RefreshCw,
  Search,
  Heart,
  Building2,
  Crosshair,
  ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getNearbyHospitals } from "@/lib/api";

type Hospital = {
  name: string;
  lat: number;
  lng: number;
  distance_km: number;
  address: string;
  phone: string | null;
  website: string | null;
  emergency: boolean;
  specialty: string | null;
  maps_url: string;
};

type HospitalsResponse = {
  count: number;
  radius_km: number;
  user_location: { lat: number; lng: number };
  hospitals: Hospital[];
};

const RADIUS_OPTIONS = [
  { label: "2 km", value: 2000 },
  { label: "5 km", value: 5000 },
  { label: "10 km", value: 10000 },
  { label: "20 km", value: 20000 },
];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.45, ease: "easeOut" },
  }),
};

export default function HospitalsPage() {
  const [data, setData] = useState<HospitalsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [radius, setRadius] = useState(5000);
  const [radiusOpen, setRadiusOpen] = useState(false);

  const fetchHospitals = useCallback(
    async (lat: number, lng: number, r: number) => {
      setLoading(true);
      setFetchError(null);
      try {
        const res = await getNearbyHospitals(lat, lng, r);
        setData(res.data);
      } catch (err: any) {
        setFetchError(
          err?.response?.data?.detail ?? "Failed to fetch hospitals. Please try again."
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const requestLocation = useCallback(() => {
    setGeoError(null);
    setFetchError(null);
    setData(null);
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by your browser.");
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lng: longitude });
        fetchHospitals(latitude, longitude, radius);
      },
      (err) => {
        setLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError("Location access was denied. Please allow location access in your browser settings and try again.");
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError("Your location could not be determined. Please try again.");
            break;
          case err.TIMEOUT:
            setGeoError("Location request timed out. Please try again.");
            break;
          default:
            setGeoError("An unknown error occurred while getting your location.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, [fetchHospitals, radius]);

  // Auto-request on mount
  useEffect(() => {
    requestLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRadiusChange = (newRadius: number) => {
    setRadius(newRadius);
    setRadiusOpen(false);
    if (coords) {
      fetchHospitals(coords.lat, coords.lng, newRadius);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold gradient-text-subtle">Nearby Hospitals</h1>
          <p className="text-muted-foreground mt-1">
            Cardiac hospitals & heart specialist centres near you
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Radius selector */}
          <div className="relative">
            <Button
              variant="outline"
              className="gap-2 rounded-xl border-gray-200"
              onClick={() => setRadiusOpen(!radiusOpen)}
            >
              <Search className="h-4 w-4" />
              {RADIUS_OPTIONS.find((o) => o.value === radius)?.label ?? "5 km"}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
            <AnimatePresence>
              {radiusOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  className="absolute right-0 top-10 z-50 w-36 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden"
                >
                  {RADIUS_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                        opt.value === radius ? "text-rose-600 font-semibold bg-rose-50" : "text-gray-700"
                      }`}
                      onClick={() => handleRadiusChange(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <Button
            onClick={() => {
              setCoords(null);
              requestLocation();
            }}
            disabled={loading}
            className="gap-2 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 shadow-lg shadow-rose-200/40 rounded-xl"
          >
            {loading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Crosshair className="h-4 w-4" />
            )}
            {loading ? "Locating…" : "Use My Location"}
          </Button>
        </div>
      </div>

      {/* Geolocation error */}
      {geoError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-amber-200 bg-amber-50 rounded-2xl">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-amber-800">Location Access Required</p>
                <p className="text-sm text-amber-700 mt-0.5">{geoError}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Fetch error */}
      {fetchError && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="border-red-200 bg-red-50 rounded-2xl">
            <CardContent className="flex items-start gap-3 p-5">
              <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-800">Could not load hospitals</p>
                <p className="text-sm text-red-700 mt-0.5">{fetchError}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Spinner while loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-rose-400/20 animate-ping" />
            <Heart className="h-12 w-12 text-rose-500 relative" />
          </div>
          <p className="text-muted-foreground font-medium">Finding hospitals near you…</p>
        </div>
      )}

      {/* Summary bar */}
      {!loading && data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4 text-rose-500" />
            <span>
              Found <span className="font-semibold text-foreground">{data.count}</span> hospital
              {data.count !== 1 ? "s" : ""} within{" "}
              <span className="font-semibold text-foreground">{data.radius_km} km</span> of your
              location
            </span>
          </div>
        </motion.div>
      )}

      {/* No results */}
      {!loading && data && data.hospitals.length === 0 && (
        <Card className="glass-card rounded-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
              <Building2 className="h-8 w-8 text-gray-400" />
            </div>
            <p className="font-semibold text-gray-600">No hospitals found nearby</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Try increasing the search radius using the selector above.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Hospital cards */}
      {!loading && data && data.hospitals.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data.hospitals.map((hospital, i) => (
            <motion.div
              key={`${hospital.name}-${i}`}
              custom={i}
              initial="hidden"
              animate="visible"
              variants={cardVariants}
            >
              <Card className="glass-card-hover rounded-2xl border-0 overflow-hidden h-full flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 shadow-md flex-shrink-0">
                        <Building2 className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-bold leading-snug line-clamp-2">
                          {hospital.name}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          {hospital.distance_km} km away
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 flex-shrink-0">
                      {hospital.emergency && (
                        <Badge variant="destructive" className="text-[10px] rounded-lg px-1.5">
                          Emergency
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-0 flex flex-col gap-3 flex-1">
                  {/* Address */}
                  {hospital.address && hospital.address !== "Address not available" && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-rose-400" />
                      <span>{hospital.address}</span>
                    </div>
                  )}

                  {/* Phone */}
                  {hospital.phone && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Phone className="h-3.5 w-3.5 flex-shrink-0 text-emerald-500" />
                      <a
                        href={`tel:${hospital.phone}`}
                        className="hover:text-foreground transition-colors"
                      >
                        {hospital.phone}
                      </a>
                    </div>
                  )}

                  {/* Website */}
                  {hospital.website && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Globe className="h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
                      <a
                        href={hospital.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-foreground transition-colors truncate"
                      >
                        {hospital.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  )}

                  {/* Specialty */}
                  {hospital.specialty && (
                    <Badge variant="secondary" className="text-[10px] rounded-lg w-fit">
                      {hospital.specialty}
                    </Badge>
                  )}

                  {/* Directions CTA */}
                  <div className="mt-auto pt-2">
                    <a
                      href={hospital.maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full"
                    >
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 rounded-xl border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                        Get Directions
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Initial state (before location requested) */}
      {!loading && !data && !geoError && !fetchError && (
        <Card className="glass-card rounded-2xl border-0">
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-rose-400/10 animate-pulse" />
              <MapPin className="h-14 w-14 text-rose-400 relative" />
            </div>
            <p className="font-semibold text-gray-600">Waiting for location…</p>
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Click &ldquo;Use My Location&rdquo; to find cardiac hospitals near you.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
