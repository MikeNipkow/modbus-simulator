import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

const useStopDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const stopDevice = async (device: ModbusDevice): Promise<boolean> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const endpoint = device.template ? "templates" : "devices";
      await apiClient.post(`/${endpoint}/${device.filename}/stop`);
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

  return { stopDevice, isLoading, errors };
};

export default useStopDevice;
