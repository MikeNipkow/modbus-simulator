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
import { useEffect, useState } from "react";

interface Props {
  device: ModbusDevice;
  onUpdate?: () => void;
}

const DeviceConfigurationCard = ({ device, onUpdate }: Props) => {
  // State to manage port input as string.
  const [port, setPort] = useState<string>(device.port.toString());

  // State to manage editable device fields.
  const [editDevice, setEditDevice] = useState<ModbusDevice>({ ...device });

  // State to manage if data has changed.
  const [dataChanged, setDataChanged] = useState(false);

  // Hook for updating device.
  const { updateDevice, isLoading } = useUpdateDevice();

  // Reset editable device state when the device prop changes.
  useEffect(() => {
    setEditDevice({ ...device });
    setDataChanged(false);
  }, [device]);

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
   * Handle port input change and validation.
   * @param value New port value as string.
   */
  const handlePortChange = (value: string) => {
    // Check if value can be parsed to number.
    const parsedValue = Number(value);
    if (value.length === 0 || isNaN(parsedValue)) {
      setPort(editDevice.port.toString());
      return;
    }

    // Check for valid port number.
    if (parsedValue < 0) {
      setField("port", 0);
      setPort("0");
      return;
    }
    if (parsedValue > 65535) {
      setField("port", 65535);
      setPort("65535");
      return;
    }

    // Check if value is integer.
    if (!Number.isInteger(parsedValue)) {
      setField("port", Math.trunc(parsedValue));
      setPort(Math.trunc(parsedValue).toString());
      return;
    }

    setField("port", parsedValue);
  };

  /**
   * Handle updating the device.
   */
  const handleUpdate = async () => {
    // Call update device hook.
    const result = await updateDevice(editDevice);

    // Update UI based on result.
    if (result.success) {
      onUpdate?.();
      setDataChanged(false);
    }

    // Show toast notification.
    result.success
      ? createSuccessToast({
          title: "Device updated",
          description: `Device "${device.filename}" has been updated.`,
        })
      : createErrorToast({
          title: "Failed to update device",
          description: result.errors,
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
                  value={port}
                  onChange={(e) => setPort(e.target.value)}
                  onBlur={(e) => handlePortChange(e.target.value)}
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
              setPort(device.port.toString());
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
