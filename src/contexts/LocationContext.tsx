import { createContext, useContext, ReactNode } from "react";
import { useLocationCurrency } from "@/hooks/useLocationCurrency";
import { useCityImage } from "@/hooks/useCityImage";

interface LocationContextValue {
    detectedCurrency: string | null;
    detectedCity: string | null;
    detectedCountry: string | null;
    loading: boolean;
    error: string | null;
    isAccessGranted: boolean;
    canOpenSettings: boolean;
    openSettings: () => void;
    imageUrl: string;
    imageLoading: boolean;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const locationData = useLocationCurrency();
    const { imageUrl, loading: imageLoading } = useCityImage(locationData.detectedCity);

    return (
        <LocationContext.Provider value={{ ...locationData, imageUrl, imageLoading }}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
    return ctx;
};
