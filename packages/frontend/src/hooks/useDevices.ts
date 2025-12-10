import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
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
