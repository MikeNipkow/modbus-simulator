import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

type DeviceAction = "start" | "stop";

export const useControlDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const startDevice = async (
    device: ModbusDevice,
  ): Promise<{ success: true } | { success: false; errors: string[] }> => {
    return controlDevice(device, "start");
  };

  const stopDevice = async (
    device: ModbusDevice,
  ): Promise<{ success: true } | { success: false; errors: string[] }> => {
    return controlDevice(device, "stop");
  };

  const controlDevice = async (
    device: ModbusDevice,
    action: DeviceAction,
  ): Promise<{ success: true } | { success: false; errors: string[] }> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const endpoint = device.template ? "templates" : "devices";
      await apiClient.post(`/${endpoint}/${device.filename}/${action}`);
      return { success: true };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors ||
        err.message ||
        `Failed to ${action} server`;
      setErrors(errorMessage);
      return {
        success: false,
        errors: Array.isArray(errorMessage) ? errorMessage : [errorMessage],
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { startDevice, stopDevice, isLoading, errors };
};
