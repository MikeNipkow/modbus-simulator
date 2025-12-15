import type { ModbusDevice } from "@/types/ModbusDevice";
import {
  Card,
  HStack,
  Icon,
  Separator,
  Text,
  VStack,
  Input,
  Textarea,
  Field,
  NativeSelect,
  Button,
} from "@chakra-ui/react";
import { FaInfoCircle } from "react-icons/fa";
import { Endian } from "@/types/enums/Endian";
import useUpdateDevice from "@/hooks/device/useUpdateDevice";
import { createErrorToast, createSuccessToast } from "../../ui/Toaster";
import { useState } from "react";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
}

const DeviceConfigurationCard = ({ device, onUpdate }: Props) => {
  // State to manage editable device fields.
  const [editDevice, setEditDevice] = useState<ModbusDevice>({ ...device });

  // State to manage if data has changed.
  const [dataChanged, setDataChanged] = useState(false);

  // Hook for updating device.
  const { updateDevice, isLoading, errors } = useUpdateDevice();

  /**
   * Set a field value in the editable device state.
   * @param field Field name.
   * @param value New value.
   */
  const setField = (field: keyof ModbusDevice, value: any) => {
    if (editDevice[field] === value) return;
    setEditDevice((prev) => ({ ...prev, [field]: value }));
    setDataChanged(true);
  };

  /**
   * Handle updating the device.
   */
  const handleUpdate = async () => {
    // Call update device hook.
    const success = await updateDevice(editDevice);

    // Update UI based on result.
    if (success) {
      onUpdate?.();
      setDataChanged(false);
    }

    // Show toast notification.
    success
      ? createSuccessToast({
          title: "Device updated",
          description: `Device "${device.filename}" has been updated.`,
        })
      : createErrorToast({
          title: "Failed to update device",
          description: errors,
        });
  };

  return (
    <Card.Root
      width="90%"
      borderRadius={"2xl"}
      boxShadow={"xl"}
      overflow="hidden"
    >
      {/* Header */}
      <Card.Header padding="24px" background="bg.medium">
        <Card.Title>
          <HStack gap={4}>
            <Icon as={FaInfoCircle} boxSize={6} color="blue.500" />
            <Text>Device Configuration</Text>
          </HStack>
        </Card.Title>
      </Card.Header>

      <Separator />

      {/* Body */}
      <Card.Body>
        <HStack gap={4} width="100%" alignItems="stretch">
          <VStack width="100%" flex={1} alignItems="stretch" gap={4}>
            {/* Name */}
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input
                value={editDevice.name ?? ""}
                onChange={(e) => setField("name", e.target.value)}
              />
            </Field.Root>

            {/* Vendor */}
            <Field.Root>
              <Field.Label>Vendor</Field.Label>
              <Input
                value={editDevice.vendor ?? ""}
                onChange={(e) => setField("vendor", e.target.value)}
              />
            </Field.Root>

            <HStack gap={4} width="100%">
              {/* Port */}
              <Field.Root width="50%">
                <Field.Label>Port</Field.Label>
                <Input
                  type="number"
                  value={editDevice.port}
                  onChange={(e) => setField("port", Number(e.target.value))}
                />
              </Field.Root>

              {/* Endian */}
              <Field.Root width="50%">
                <Field.Label>Endian</Field.Label>
                <NativeSelect.Root size="md">
                  <NativeSelect.Field
                    value={editDevice.endian}
                    onChange={(e) =>
                      setField("endian", e.target.value as Endian)
                    }
                    focusRingColor="primary"
                  >
                    <option value={Endian.BigEndian}>Big Endian</option>
                    <option value={Endian.LittleEndian}>Little Endian</option>
                  </NativeSelect.Field>
                </NativeSelect.Root>
              </Field.Root>
            </HStack>
          </VStack>

          <Separator orientation="vertical" marginX="12px" />

          <VStack width="100%" flex={1} alignItems="stretch">
            {/* Description */}
            <Field.Root style={{ flex: 1, height: "100%" }}>
              <Field.Label
                style={{
                  height: "40px",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                Description
              </Field.Label>
              <Textarea
                value={editDevice.description ?? ""}
                onChange={(e) => setField("description", e.target.value)}
                height="100%"
                resize="vertical"
              />
            </Field.Root>
          </VStack>
        </HStack>
      </Card.Body>

      <Separator />

      {/* Footer */}
      <Card.Footer padding="24px" background="bg.medium">
        <HStack width="100%" justify={"flex-end"}>
          {/* Save button */}
          <Button
            variant="primary"
            loading={isLoading}
            onClick={handleUpdate}
            disabled={!dataChanged}
          >
            Save
          </Button>

          {/* Reset button */}
          <Button
            variant="outline"
            onClick={() => {
              setEditDevice({ ...device });
              setDataChanged(false);
            }}
            disabled={!dataChanged}
          >
            Reset
          </Button>
        </HStack>
      </Card.Footer>
    </Card.Root>
  );
};

export default DeviceConfigurationCard;
