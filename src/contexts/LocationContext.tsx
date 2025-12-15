import { createContext, useContext, ReactNode } from "react";
import { useLocationCurrency } from "@/hooks/useLocationCurrency";

interface LocationContextValue {
    detectedCurrency: string | null;
    detectedCity: string | null;
    detectedCountry: string | null;
    loading: boolean;
    error: string | null;
    isAccessGranted: boolean;
    canOpenSettings: boolean;
    openSettings: () => void;
}

const LocationContext = createContext<LocationContextValue | undefined>(undefined);

export const LocationProvider = ({ children }: { children: ReactNode }) => {
    const locationData = useLocationCurrency();

    return (
        <LocationContext.Provider value={locationData}>
            {children}
        </LocationContext.Provider>
    );
};

export const useLocation = () => {
    const ctx = useContext(LocationContext);
    if (!ctx) throw new Error("useLocation must be used within a LocationProvider");
    return ctx;
};
