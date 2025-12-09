import apiClient from "@/archive_1/services/api-client";
import type { ModbusDevice } from "@/archive_1/types/ModbusDevice";
import { useEffect, useState } from "react";

const useDevices = (templates: boolean = false) => {
  const [devices, setDevices] = useState<ModbusDevice[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    apiClient
      .get(templates ? "/templates" : "/devices")
      .then((response) => {
        setDevices(response.data);
      })
      .catch((error) => {
        setErrors((prevErrors) => [...prevErrors, error.message]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return { devices, errors, isLoading };
};

export default useDevices;
