import type { ModbusDevice } from "@/archive/types/ModbusDevice";
import apiClient from "@/services/api-client";
import { useEffect, useState } from "react";

const useDevices = (templates: boolean = false) => {
  const [devices, setDevices] = useState<ModbusDevice[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    apiClient
      .get(templates ? "/templates" : "/devices")
      .then((response) => {
        setDevices(response.data);
      })
      .catch((error) => {
        setErrors((prevErrors) => [...prevErrors, error.message]);
      });
  }, []);

  return { devices, errors };
};
