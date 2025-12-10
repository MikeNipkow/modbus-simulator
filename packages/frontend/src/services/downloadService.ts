import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";

/**
 * Fetches download data as Blob for use with DownloadTrigger
 */
export const fetchDeviceData = async (device: ModbusDevice): Promise<Blob> => {
  const endpoint = device.template ? "templates" : "devices";
  const response = await apiClient.get(
    `/${endpoint}/${device.filename}/download`,
    { responseType: "blob" },
  );
  return response.data;
};
