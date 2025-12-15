import apiClient from "@/services/apiClient";
import type { DataPoint } from "@/types/DataPoint";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

const useCreateDatapoint = () => {
  const [datapoint, setDatapoint] = useState<DataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const createDatapoint = async (
    device: ModbusDevice,
    unitId: number,
    datapoint: DataPoint,
  ): Promise<
    | { success: true; datapoint: DataPoint }
    | { success: false; errors: string[] }
  > => {
    setDatapoint(null);
    setIsLoading(true);
    setErrors([]);

    try {
      const deviceTypeEndpoint = device.template ? "templates" : "devices";
      const endpoint = `${deviceTypeEndpoint}/${device.filename}/units/${unitId}/datapoints`;
      await apiClient.post(endpoint, datapoint);
      return { success: true, datapoint };
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors ||
        err.message ||
        "Failed to create datapoint";
      setErrors(errorMessage);
      return {
        success: false,
        errors: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { createDatapoint, datapoint, isLoading, errors };
};

export default useCreateDatapoint;
