import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

const useUpdateDevice = () => {
  const [device, setDevice] = useState<ModbusDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const updateDevice = async (device: ModbusDevice): Promise<boolean> => {
    setDevice(null);
    setIsLoading(true);
    setErrors([]);

    try {
      const endpoint = device.template ? "templates" : "devices";
      await apiClient.put(`/${endpoint}/${device.filename}`, device);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors || err.message || "Failed to update device";
      setErrors(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateDevice, device, isLoading, errors };
};

export default useUpdateDevice;
