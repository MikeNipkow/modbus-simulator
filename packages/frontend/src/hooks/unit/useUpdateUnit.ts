import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import { useState } from "react";

const useUpdateUnit = () => {
  const [unit, setUnit] = useState<ModbusUnit | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const updateUnit = async (
    currentUnitId: number,
    device: ModbusDevice,
    unit: ModbusUnit,
  ): Promise<
    { success: true; unit: ModbusUnit } | { success: false; errors: string[] }
  > => {
    setUnit(null);
    setIsLoading(true);
    setErrors([]);

    try {
      const deviceTypeEndpoint = device.template ? "templates" : "devices";
      const endpoint = `/${deviceTypeEndpoint}/${device.filename}/units/${currentUnitId}`;
      await apiClient.put(endpoint, unit);
      return { success: true, unit };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors || err.message || "Failed to update unit";
      setErrors(errorMessage);
      return {
        success: false,
        errors: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { updateUnit, unit, isLoading, errors };
};

export default useUpdateUnit;
