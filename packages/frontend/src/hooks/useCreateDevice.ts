import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

export const useCreateDevice = () => {
  const [device, setDevice] = useState<ModbusDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const createDevice = async (
    device: ModbusDevice,
    isTemplate: boolean,
  ): Promise<boolean> => {
    setIsLoading(true);
    setErrors([]);
    setDevice(null);

    try {
      const endpoint = isTemplate ? "/templates" : "/devices";
      const response = await apiClient.post(endpoint, device);
      setDevice(response.data);
      return true; // Success
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors || [
        err.message || "Unknown error",
      ];
      setErrors(errorMessage);
      return false; // Failure
    } finally {
      setIsLoading(false);
    }
  };

  return { createDevice, device, isLoading, errors };
};
