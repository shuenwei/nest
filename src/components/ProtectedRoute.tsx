import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import axios from "axios";
import LoadingScreen from "@/components/LoadingScreen";
import { toast } from "sonner";

const ProtectedRoute = () => {
  const [isInvalid, setIsInvalid] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setIsInvalid(true);
        setIsLoading(false);
        return;
      }

      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/verifytoken`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const valid = res.data.valid === true && res.data.payload.telegramId === localStorage.getItem("telegramId");

        if (!valid) setIsInvalid(true); 

      } catch (err) {
        console.error("Token validation failed:", err);
        toast.error("Something went wrong. Please refresh your app.");
      } finally {
        setIsLoading(false);
      }
    };

    validateToken();
  }, []);

  if (isLoading) return <LoadingScreen />;

  if (isInvalid) {
    localStorage.removeItem("telegramId");
    localStorage.removeItem("token");
    toast.error("Please re-login.");
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
};

export default ProtectedRoute;
