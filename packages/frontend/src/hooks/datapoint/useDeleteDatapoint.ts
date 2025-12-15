import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

export const useDeleteDatapoint = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const deleteDatapoint = async (
    device: ModbusDevice,
    unitId: number,
    datapointId: string,
  ): Promise<{ success: true } | { success: false; errors: string[] }> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const deviceTypeEndpoint = device.template ? "templates" : "devices";
      const endpoint = `/${deviceTypeEndpoint}/${device.filename}/units/${unitId}/datapoints/${datapointId}`;
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

  return { deleteDatapoint, isLoading, errors };
};
