import type { ModbusDevice } from "@/types/ModbusDevice";
import { Button, HStack, Status, Text } from "@chakra-ui/react";

interface Props {
  device: ModbusDevice;
  isSelected?: boolean;
  onClick?: () => void;
}

const DeviceButton = ({ device, isSelected = false, onClick }: Props) => {
  return (
    <Button
      variant={"sidebar"}
      paddingLeft={"20px"}
      justifyContent={"space-between"}
      borderLeft={"4px solid"}
      borderColor={"brand"}
      onClick={onClick}
    >
      <Text
        fontWeight={isSelected ? "bold" : "normal"}
        color={isSelected ? "brand" : ""}
      >
        {device.filename}
      </Text>

      {/* Only for Device buttons, hidden for template buttons */}
      {!device.template && (
        <HStack>
          <Text fontSize={"xs"} fontWeight={"normal"}>
            Port {device.port}
          </Text>

          <Status.Root colorPalette={device.running ? "green" : "red"}>
            <Status.Indicator />
          </Status.Root>
        </HStack>
      )}
    </Button>
  );
};

export default DeviceButton;
