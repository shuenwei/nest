import { useState, useEffect } from "react";
import axios from "axios";
import { getCurrencyFromCountryCode } from "@/lib/currencies";

export const useLocationCurrency = () => {
    const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null);
    const [detectedCity, setDetectedCity] = useState<string | null>(null);
    const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!("geolocation" in navigator)) {
            setError("Geolocation not supported");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const response = await axios.get(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
                    );
                    const { countryCode, locality, city, countryName } = response.data;

                    if (countryCode) {
                        const currency = getCurrencyFromCountryCode(countryCode);
                        setDetectedCurrency(currency);
                    }

                    if (locality || city) {
                        setDetectedCity(locality || city);
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
            },
            (err) => {
                console.error("Geolocation error:", err);
                setError(err.message);
                setLoading(false);
            }
        );
    }, []);

    return { detectedCurrency, detectedCity, detectedCountry, loading, error };
};
