import type { ModbusDevice } from "@/types/ModbusDevice";
import { Tabs, VStack } from "@chakra-ui/react";
import DeviceOverviewCard from "./device/DeviceOverviewCard";
import DeviceConfigurationCard from "./device/DeviceConfigurationCard";
import UnitOverviewCard from "./unit/UnitOverviewCard";
import { LuFileClock } from "react-icons/lu";
import { FaInfo } from "react-icons/fa";
import { FaGears } from "react-icons/fa6";
import DeviceLogTable from "./device/DeviceLogTable";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const DeviceEditor = ({ device, onUpdate, onDelete }: Props) => {
  return (
    <Tabs.Root fitted variant={"line"} defaultValue="config">
      <Tabs.List>
        <Tabs.Trigger value="config">
          <FaInfo />
          Device Configuration
        </Tabs.Trigger>
        <Tabs.Trigger value="units">
          <FaGears />
          Modbus Units
        </Tabs.Trigger>
        <Tabs.Trigger value="logs">
          <LuFileClock />
          Logs
        </Tabs.Trigger>
      </Tabs.List>
      <Tabs.Content value="config">
        <VStack>
          {/* Device Overview */}
          <DeviceOverviewCard
            device={device}
            onUpdate={() => onUpdate?.()}
            onDelete={onDelete}
          />
          {/* Device Configuration */}
          <DeviceConfigurationCard device={device} onUpdate={onUpdate} />
        </VStack>
      </Tabs.Content>
      <Tabs.Content value="units">
        <VStack>
          {/* Unit Overview */}
          <UnitOverviewCard device={device} onUpdate={onUpdate} />
        </VStack>
      </Tabs.Content>
      <Tabs.Content value="logs">
        <VStack>
          <DeviceLogTable device={device} />
        </VStack>
      </Tabs.Content>
    </Tabs.Root>
  );
};

export default DeviceEditor;
