import { FaBook, FaHome, FaNetworkWired, FaPlus } from "react-icons/fa";
import SidebarButton from "./SidebarButton";
import SidebarDropdownButton from "./SidebarDropdownButton";
import { VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import apiClient from "@/services/api-client";
import type { ModbusDevice } from "@/types/ModbusDevice";
import DeviceButton from "./DeviceButton";
import DeviceAddButton from "./DeviceAddButton";

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
        <DeviceAddButton title="Add Device" />
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
        <DeviceAddButton title="Add Template" />
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
