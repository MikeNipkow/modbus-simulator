import type { ModbusDevice } from "@/types/ModbusDevice";
import { Button, HStack, Icon, Text } from "@chakra-ui/react";
import { FaCircle } from "react-icons/fa";

interface DeviceButtonProps {
    device: ModbusDevice;
    showState?: boolean;
    isSelected?: boolean;
    onClick?: () => void;
}

function DeviceButton({ device, showState = true, isSelected = false, onClick }: DeviceButtonProps) {
    return (
        <Button
            width="100%"
            justifyContent="flex-start"
            variant="ghost"
            onClick={onClick}
            padding="12px"
            paddingLeft="20px"
            height="auto"
            borderRadius={0}
            color={isSelected ? "#81A938" : "gray.600"}
            fontWeight={isSelected ? "bold" : "normal"}
            _hover={!isSelected ? { color: "#81A938" } : undefined}
            userSelect="text"
        >
            <HStack width="100%" gap={2} overflow="hidden">
                <Text 
                    flex={1} 
                    textAlign="left" 
                    truncate
                    minWidth={0}
                    overflow="hidden"
                    textOverflow="ellipsis"
                    whiteSpace="nowrap"
                    title={device.filename}
                >
                    {device.filename}
                </Text>

                {showState && (
                    <HStack gap={2} flexShrink={0}>
                        <Text 
                            fontSize="xs" 
                            color="gray.400"
                            fontWeight="normal"
                        >
                        Port {device.port}
                    </Text>

                    <Icon 
                        as={FaCircle} 
                        boxSize={3} 
                        color={device.running ? "green.500" : "red.500"}
                    />
                </HStack>
                )}
            </HStack>
        </Button>
    );
}

export default DeviceButton;
