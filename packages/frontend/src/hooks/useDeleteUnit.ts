import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import { useState } from "react";

export const useDeleteUnit = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const deleteUnit = async (
    device: ModbusDevice,
    unitId: number,
  ): Promise<boolean> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const deviceTypeEndpoint = device.template ? "templates" : "devices";
      const endpoint = `/${deviceTypeEndpoint}/${device.filename}/units/${unitId}`;
      await apiClient.delete(endpoint);
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

  return { deleteUnit, isLoading, errors };
};
