import { FaBook, FaHome, FaNetworkWired } from "react-icons/fa";
import SidebarButton from "./SidebarButton";
import SidebarDropdownButton from "./SidebarDropdownButton";
import { VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import apiClient from "@/services/api-client";
import type { ModbusDevice } from "@/types/ModbusDevice";
import DeviceButton from "./DeviceButton";

interface Props {
  selectedDevice?: ModbusDevice | null;
  onSelectDevice?: (device: ModbusDevice | null) => void;
}

const SideBar = ({ selectedDevice, onSelectDevice }: Props) => {
  const [devices, setDevices] = useState<ModbusDevice[]>([]);
  const [templates, setTemplates] = useState<ModbusDevice[]>([]);

  useEffect(() => {
    apiClient
      .get<ModbusDevice[]>("/devices")
      .then((response) => setDevices(response.data))
      .catch((error) => console.error("Error fetching devices:", error));
  }, []);

  useEffect(() => {
    apiClient
      .get<ModbusDevice[]>("/templates")
      .then((response) => setTemplates(response.data))
      .catch((error) => console.error("Error fetching devices:", error));
  }, []);

  return (
    <VStack width={"100%"} gap={0}>
      <SidebarButton
        icon={FaHome}
        text="Home"
        onClick={() => onSelectDevice?.(null)}
      />

      <SidebarDropdownButton icon={FaNetworkWired} text="Devices">
        {devices.map((device) => (
          <DeviceButton
            key={device.filename}
            device={device}
            isSelected={
              !selectedDevice?.template &&
              selectedDevice?.filename === device.filename
            }
            onClick={() => onSelectDevice?.(device)}
          />
        ))}
      </SidebarDropdownButton>

      <SidebarDropdownButton icon={FaBook} text="Templates">
        {templates.map((device) => (
          <DeviceButton
            key={device.filename}
            device={device}
            isSelected={
              selectedDevice?.template &&
              selectedDevice?.filename === device.filename
            }
            onClick={() => onSelectDevice?.(device)}
          />
        ))}
      </SidebarDropdownButton>
    </VStack>
  );
};

export default SideBar;
