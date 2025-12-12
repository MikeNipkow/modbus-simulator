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
} from "@chakra-ui/react";
import { FaInfoCircle } from "react-icons/fa";
import { Endian } from "@/types/enums/Endian";

interface Props {
  device: ModbusDevice;
  setField: (field: keyof ModbusDevice, value: any) => void;
}

const DeviceConfigurationCard = ({ device, setField }: Props) => {
  return (
    <Card.Root
      width="80%"
      borderRadius={"2xl"}
      boxShadow={"xl"}
      overflow="hidden"
    >
      <Card.Header padding="24px" background="bg.medium">
        <Card.Title>
          <HStack gap={4}>
            <Icon as={FaInfoCircle} boxSize={6} color="blue.500" />
            <Text>Device Configuration</Text>
          </HStack>
        </Card.Title>
      </Card.Header>
      <Separator />

      <Card.Body>
        <HStack gap={4} width="100%" alignItems="stretch">
          <VStack width="100%" flex={1} alignItems="stretch" gap={4}>
            {/* Name, Vendor, Port, Endian */}
            <Field.Root>
              <Field.Label>Name</Field.Label>
              <Input
                value={device.name ?? ""}
                onChange={(e) => setField("name", e.target.value)}
              />
            </Field.Root>
            <Field.Root>
              <Field.Label>Vendor</Field.Label>
              <Input
                value={device.vendor ?? ""}
                onChange={(e) => setField("vendor", e.target.value)}
              />
            </Field.Root>
            <HStack gap={4} width="100%">
              <Field.Root width="50%">
                <Field.Label>Port</Field.Label>
                <Input
                  type="number"
                  value={device.port}
                  onChange={(e) => setField("port", Number(e.target.value))}
                />
              </Field.Root>
              <Field.Root width="50%">
                <Field.Label>Endian</Field.Label>
                <NativeSelect.Root size="md">
                  <NativeSelect.Field
                    value={device.endian}
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
                value={device.description ?? ""}
                onChange={(e) => setField("description", e.target.value)}
                height="100%"
                resize="vertical"
              />
            </Field.Root>
          </VStack>
        </HStack>
      </Card.Body>
    </Card.Root>
  );
};

export default DeviceConfigurationCard;
