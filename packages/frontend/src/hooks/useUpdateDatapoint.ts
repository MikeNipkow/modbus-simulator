import apiClient from "@/services/apiClient";
import type { DataPoint } from "@/types/DataPoint";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

const useUpdateDatapoint = () => {
  const [datapoint, setDatapoint] = useState<DataPoint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const updateDatapoint = async (
    device: ModbusDevice,
    unitId: number,
    datapoint: DataPoint,
  ): Promise<boolean> => {
    setDatapoint(null);
    setIsLoading(true);
    setErrors([]);

    try {
      const deviceTypeEndpoint = device.template ? "templates" : "devices";
      const endpoint = `${deviceTypeEndpoint}/${device.filename}/units/${unitId}/datapoints/${datapoint.id}`;
      await apiClient.put(endpoint, datapoint);
      return true;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.errors ||
        err.message ||
        "Failed to update datapoint";
      setErrors(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { updateDatapoint, datapoint, isLoading, errors };
};

export default useUpdateDatapoint;
