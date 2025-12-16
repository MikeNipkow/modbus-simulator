import apiClient from "@/services/apiClient";
import type { LogMessage } from "@/types/enums/LogLevel";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useEffect, useState } from "react";

const useLogs = (device: ModbusDevice, deps?: any[]) => {
  const [logs, setLogs] = useState<LogMessage[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(
    () => {
      setIsLoading(true);
      apiClient
        .get(
          (device.template ? "/templates" : "/devices") +
            `/${device.filename}/logs`,
        )
        .then((response) => {
          setLogs(response.data);
          console.log(response.data);
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

  return { logs, errors, isLoading };
};

export default useLogs;
