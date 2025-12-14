import { useState, useEffect } from "react";
import axios from "axios";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1525625293386-3f8f99389edd"; // Default city image

export const useCityImage = (country: string | null) => {
    const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!country) return;

        const fetchImage = async () => {
            setLoading(true);
            try {
                if (!UNSPLASH_ACCESS_KEY) {
                    console.warn("Unsplash API key is missing. Using default image.");
                    return;
                }

                const response = await axios.get("https://api.unsplash.com/search/photos", {
                    params: { query: `${country}`, per_page: 1, orientation: "landscape" },
                    headers: {
                        Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                    },
                });

                if (response.data.results && response.data.results.length > 0) {
                    setImageUrl(response.data.results[0].urls.full);
                }
            } catch (error) {
                console.error("Error fetching image from Unsplash:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchImage();
    }, [country]);

    return { imageUrl, loading };
};
