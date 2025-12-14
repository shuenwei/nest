import { useState, useEffect } from "react";
import axios from "axios";
import { getImage, saveImage } from "@/lib/imageDB";

const UNSPLASH_ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const DEFAULT_IMAGE = "https://images.unsplash.com/photo-1525625293386-3f8f99389edd"; // Default city image

export const useCityImage = (city: string | null) => {
    const [imageUrl, setImageUrl] = useState<string>(DEFAULT_IMAGE);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!city) {
            setLoading(false);
            return;
        }

        const loadAndCacheImage = async () => {
            setLoading(true);
            try {
                // 1. Check local DB first
                const cachedBlob = await getImage(city);
                if (cachedBlob) {
                    const objectUrl = URL.createObjectURL(cachedBlob);
                    setImageUrl(objectUrl);
                    setLoading(false);
                    return;
                }

                // 2. If not in DB, fetch from Unsplash API
                if (!UNSPLASH_ACCESS_KEY) {
                    console.warn("Unsplash API key is missing. Using default image.");
                    setLoading(false);
                    return;
                }

                // Get image URL
                const searchResponse = await axios.get(
                    "https://api.unsplash.com/search/photos",
                    {
                        params: {
                            query: city,
                            per_page: 1,
                            orientation: "landscape",
                        },
                        headers: {
                            Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}`,
                        },
                    }
                );

                if (searchResponse.data.results?.length > 0) {
                    const downloadUrl = searchResponse.data.results[0].urls.full; // Use full for high quality

                    // 3. Download the actual image data
                    const imageResponse = await axios.get(downloadUrl, {
                        responseType: "blob",
                    });

                    const imageBlob = imageResponse.data;

                    // 4. Save to DB and update state
                    await saveImage(city, imageBlob);
                    const objectUrl = URL.createObjectURL(imageBlob);
                    setImageUrl(objectUrl);
                }
            } catch (error) {
                console.error("Error loading/caching city image:", error);
            } finally {
                setLoading(false);
            }
        };

        loadAndCacheImage();
    }, [city]);

    // Clean up ObjectURLs when imageUrl changes or component unmounts
    useEffect(() => {
        return () => {
            if (imageUrl && imageUrl.startsWith("blob:")) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [imageUrl]);

    return { imageUrl, loading };
};
