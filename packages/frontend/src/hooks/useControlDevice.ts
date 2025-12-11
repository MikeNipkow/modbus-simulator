import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

type DeviceAction = "start" | "stop";

export const useControlDevice = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const startDevice = async (device: ModbusDevice): Promise<boolean> => {
    return controlDevice(device, "start");
  };

  const stopDevice = async (device: ModbusDevice): Promise<boolean> => {
    return controlDevice(device, "stop");
  };

  const controlDevice = async (
    device: ModbusDevice,
    action: DeviceAction,
  ): Promise<boolean> => {
    setIsLoading(true);
    setErrors([]);

    try {
      const endpoint = device.template ? "templates" : "devices";
      await apiClient.post(`/${endpoint}/${device.filename}/${action}`);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors ||
        err.message ||
        `Failed to ${action} server`;
      setErrors(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { startDevice, stopDevice, isLoading, errors };
};
