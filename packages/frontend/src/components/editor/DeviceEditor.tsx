import type { ModbusDevice } from "@/types/ModbusDevice";
import { VStack } from "@chakra-ui/react";
import DeviceOverviewCard from "./device/DeviceOverviewCard";
import DeviceConfigurationCard from "./device/DeviceConfigurationCard";
import UnitOverviewCard from "./unit/UnitOverviewCard";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
  onDelete?: () => void;
}

const DeviceEditor = ({ device, onUpdate, onDelete }: Props) => {
  return (
    <VStack width="100%" alignItems="center" padding="16px" gap={"24px"}>
      {/* Device Overview */}
      <DeviceOverviewCard
        device={device}
        onUpdate={() => onUpdate?.()}
        onDelete={onDelete}
      />

      {/* Device Configuration */}
      <DeviceConfigurationCard device={device} onUpdate={onUpdate} />

      {/* Unit Overview */}
      <UnitOverviewCard device={device} onUpdate={onUpdate} />
    </VStack>
  );
};

export default DeviceEditor;
