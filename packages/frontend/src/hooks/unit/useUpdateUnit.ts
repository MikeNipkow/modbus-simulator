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
  ): Promise<boolean> => {
    setUnit(null);
    setIsLoading(true);
    setErrors([]);

    try {
      const deviceTypeEndpoint = device.template ? "templates" : "devices";
      const endpoint = `/${deviceTypeEndpoint}/${device.filename}/units/${currentUnitId}`;
      await apiClient.put(endpoint, unit);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors || err.message || "Failed to update unit";
      setErrors(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateUnit, unit, isLoading, errors };
};

export default useUpdateUnit;
