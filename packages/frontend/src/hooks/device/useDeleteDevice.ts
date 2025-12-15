import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

export const useDeleteDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const deleteDevice = async (
    device: ModbusDevice,
  ): Promise<{ success: true } | { success: false; errors: string[] }> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const endpoint =
        (device.template ? "/templates" : "/devices") + `/${device.filename}`;
      await apiClient.delete(endpoint);
      return { success: true }; // Success
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors || [
        err.message || "Unknown error",
      ];
      setErrors(errorMessage);
      return { success: false, errors: errorMessage }; // Failure
    } finally {
      setIsLoading(false);
    }
  };

  return { deleteDevice, isLoading, errors };
};
