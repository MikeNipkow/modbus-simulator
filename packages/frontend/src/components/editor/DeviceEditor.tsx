import type { ModbusDevice } from "@/types/ModbusDevice";
import { VStack, Button, HStack } from "@chakra-ui/react";
import DeviceOverviewCard from "./DeviceOverviewCard";
import DeviceConfigurationCard from "./DeviceConfigurationCard";
import { useState, useEffect } from "react";
import useUpdateDevice from "@/hooks/useUpdateDevice";
import { toaster } from "../ui/Toaster";

interface Props {
  device: ModbusDevice;
  onUpdate?: (device: ModbusDevice) => void;
  onDelete?: () => void;
}

const DeviceEditor = ({ device, onUpdate, onDelete }: Props) => {
  const {
    updateDevice,
    device: updatedDevice,
    isLoading,
    errors,
  } = useUpdateDevice();
  const [editDevice, setEditDevice] = useState<ModbusDevice>({ ...device });

  useEffect(() => {
    setEditDevice({ ...device });
  }, [device]);

  const setField = (field: keyof ModbusDevice, value: any) => {
    setEditDevice((prev) => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setEditDevice({ ...device });
    toaster.create({
      title: "Changes reset",
      type: "success",
      description: `Device settings for device "${device.filename}" were discarded.`,
      closable: true,
    });
  };

  const handleSave = async () => {
    if (await updateDevice(editDevice)) {
      onUpdate?.(editDevice);
      toaster.create({
        title: "Changes saved",
        type: "success",
        description: `Device "${editDevice.filename}" has been updated.`,
        closable: true,
      });
    } else
      toaster.create({
        title: "Failed to save device",
        type: "error",
        description: errors,
        closable: true,
      });
  };

  return (
    <VStack width="100%" alignItems="center" padding="16px" gap={"24px"}>
      <DeviceOverviewCard
        device={device}
        onUpdate={() => onUpdate?.(editDevice)}
        onDelete={onDelete}
      />
      <DeviceConfigurationCard device={editDevice} setField={setField} />
      <HStack gap={4} marginTop={4}>
        <Button variant="primary" onClick={handleSave}>
          Save
        </Button>
        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </HStack>
    </VStack>
  );
};

export default DeviceEditor;
