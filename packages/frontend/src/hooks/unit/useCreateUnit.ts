import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import { useState } from "react";

export const useCreateUnit = () => {
  const [unit, setUnit] = useState<ModbusUnit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const createUnit = async (
    device: ModbusDevice,
    unitId: number,
  ): Promise<
    { success: true; unit: ModbusUnit } | { success: false; errors: string[] }
  > => {
    setIsLoading(true);
    setErrors([]);
    setUnit(null);

    try {
      const unit: ModbusUnit = { unitId };

      const deviceTypeEndpoint = device.template ? "templates" : "devices";
      const endpoint = `/${deviceTypeEndpoint}/${device.filename}/units`;
      const response = await apiClient.post(endpoint, unit);
      setUnit(response.data);
      return { success: true, unit: response.data }; // Success
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

  return { createUnit, unit, isLoading, errors };
};
