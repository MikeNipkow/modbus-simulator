import apiClient from "@/services/apiClient";
import { useEffect, useState } from "react";

const useBackendVersion = (deps?: any[]) => {
  const [version, setVersion] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(
    () => {
      setIsLoading(true);
      apiClient
        .get("/version")
        .then((response) => {
          setVersion(response.data);
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

  return { version, errors, isLoading };
};

export default useBackendVersion;
