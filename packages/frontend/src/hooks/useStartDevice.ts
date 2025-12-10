import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

const useStartDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const startDevice = async (device: ModbusDevice): Promise<boolean> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const endpoint = device.template ? "templates" : "devices";
      await apiClient.post(`/${endpoint}/${device.filename}/start`);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.error || err.message || "Failed to start server";
      setErrors(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { startDevice, isLoading, errors };
};

export default useStartDevice;
