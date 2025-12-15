import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrencyFromCountryCode } from "@/lib/currencies";

export const useLocationCurrency = () => {
    const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
    const [detectedCity, setDetectedCity] = useState<string | null>(null);
    const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [isAccessGranted, setIsAccessGranted] = useState(false);
    const [canOpenSettings, setCanOpenSettings] = useState(false);

    const openSettings = () => {
        const locationManager = window.Telegram?.WebApp?.LocationManager;
        if (locationManager) {
            locationManager.openSettings();
        } else {
            console.warn("LocationManager not available");
        }
    };

    useEffect(() => {
        const fetchDetails = async (latitude: number, longitude: number) => {
            try {
                const response = await axios.get(
                    `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                );
                const { countryCode, locality, city, countryName } = response.data;

                if (countryCode) {
                    const currency = getCurrencyFromCountryCode(countryCode);
                    setDetectedCurrency(currency);
                }

                if (city || locality) {
                    setDetectedCity(city || locality);
                }

                if (countryName) {
                    setDetectedCountry(countryName);
                }
            } catch (err) {
                console.error("Error fetching location data:", err);
                setError("Failed to fetch location data");
            } finally {
                setLoading(false);
            }
        };

        const locationManager = window.Telegram?.WebApp?.LocationManager;
        const isInTelegram = !!window.Telegram?.WebApp?.initData;

        if (locationManager && isInTelegram) {
            setCanOpenSettings(true);
            setLoading(true);
            try {
                locationManager.init(() => {
                    if (locationManager.isLocationAvailable) {
                        setIsAccessGranted(locationManager.isAccessGranted);
                    }

                    locationManager.getLocation((data) => {
                        if (data) {
                            setIsAccessGranted(true);
                            fetchDetails(data.latitude, data.longitude);
                        } else {
                            console.error("Telegram LocationManager returned null data");
                            setError("Failed to get location from Telegram");
                            setLoading(false);
                        }
                    });
                });
            } catch (e) {
                console.error("Error initializing Telegram LocationManager:", e);
                // Fallback to standard geolocation if Telegram init fails
                if (!("geolocation" in navigator)) {
                    setError("Geolocation not supported");
                    setLoading(false);
                    return;
                }

                // Fallback logic
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setIsAccessGranted(true);
                        fetchDetails(latitude, longitude);
                    },
                    (err) => {
                        console.error("Geolocation error:", err);
                        setError(err.message);
                        setLoading(false);
                        setIsAccessGranted(false);
                    }
                );
            }
            return;
        }

        if (!("geolocation" in navigator)) {
            setError("Geolocation not supported");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setIsAccessGranted(true);
                fetchDetails(latitude, longitude);
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError(err.message);
                setLoading(false);
                setIsAccessGranted(false);
            }
        );
    }, []);

    return { detectedCurrency, detectedCity, detectedCountry, loading, error, isAccessGranted, canOpenSettings, openSettings };
};
