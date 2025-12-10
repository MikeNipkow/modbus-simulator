import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useEffect, useState } from "react";

const useDevices = (templates: boolean = false, deps?: any[]) => {
  const [devices, setDevices] = useState<Map<string, ModbusDevice>>(
    new Map<string, ModbusDevice>(),
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(
    () => {
      setIsLoading(true);
      apiClient
        .get(templates ? "/templates" : "/devices")
        .then((response) => {
          setDevices(
            new Map(
              response.data.map((device: ModbusDevice) => [
                device.filename,
                device,
              ]),
            ),
          );
        })
        .catch((error) => {
          setErrors((prevErrors) => [...prevErrors, error.message]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    },
    deps ? [...deps] : [],
  );

  return { devices, errors, isLoading };
};

export default useDevices;
