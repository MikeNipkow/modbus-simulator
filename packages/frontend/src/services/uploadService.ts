import apiClient from "@/services/apiClient";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState } from "react";

export const uploadTemplateFile = () => {
  const [device, setDevice] = useState<ModbusDevice | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const uploadFile = async (file: File): Promise<ModbusDevice | null> => {
    setIsLoading(true);
    setErrors([]);
    setDevice(null);

    try {
      const form = new FormData();
      form.append("file", file, file.name);

      const response = await apiClient.post("/templates/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setDevice(response.data);
      return response.data; // Success
    } catch (err: any) {
      const errorMessage = err.response?.data?.errors || [
        err.message || "Unknown error",
      ];
      setErrors(errorMessage);
      return null; // Failure
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadFile, device, isLoading, errors };
};

export default { uploadTemplateFile };
