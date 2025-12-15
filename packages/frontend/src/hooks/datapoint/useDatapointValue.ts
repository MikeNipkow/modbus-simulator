import apiClient from "@/services/apiClient";
import type { DataPoint } from "@/types/DataPoint";
import type { ModbusDevice } from "@/types/ModbusDevice";
import type { ModbusUnit } from "@/types/ModbusUnit";
import { deserializeValue } from "@/util/jsonUtils";
import { useEffect, useState } from "react";

const useDatapointValue = (
  device: ModbusDevice,
  unit: ModbusUnit,
  datapoint: DataPoint,
  deps?: any[],
) => {
  const [value, setValue] = useState<boolean | string | number | bigint>(
    datapoint.value!,
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(
    () => {
      setIsLoading(true);

      const deviceTypeEndpoint = device.template ? "/templates" : "/devices";
      const endpoint = `${deviceTypeEndpoint}/${device.filename}/units/${unit.unitId}/datapoints/${datapoint.id}/value`;
      apiClient
        .get(endpoint)
        .then((response) => {
          setValue(deserializeValue(response.data.value));
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

  return { value, errors, isLoading };
};

export default useDatapointValue;
