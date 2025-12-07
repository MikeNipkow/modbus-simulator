import { FaNetworkWired, FaBook, FaHome } from "react-icons/fa";
import DeviceList from "./DeviceList";
import useDevices from "@/hooks/useDevices";
import DeviceButton from "./DeviceButton";
import DeviceAddButton from "./DeviceAddButton";
import useTemplates from "@/hooks/useTemplates";
import { Center, Spinner, Text, Button, Icon } from "@chakra-ui/react";
import type { ModbusDevice } from "@/types/ModbusDevice";

interface SideBarProps {
    selectedDevice: ModbusDevice | undefined;
    onSelectDevice: (device: ModbusDevice | undefined) => void;
}

function SideBar({ selectedDevice, onSelectDevice }: SideBarProps) {
    const { data: devices, error: devicesError, isLoading: devicesLoading } = useDevices();
    const { data: templates, error: templatesError, isLoading: templatesLoading } = useTemplates();

    return (
        <>
            <Button
                width="100%"
                justifyContent="flex-start"
                variant="ghost"
                onClick={() => onSelectDevice(undefined)}
                padding="12px"
                height="auto"
                borderRadius={0}
                gap={2}
                color={selectedDevice === undefined ? "white" : "gray.600"}
                bg={selectedDevice === undefined ? "#81A938" : undefined}
                _hover={{ bg: selectedDevice === undefined ? "#81A938" : "gray.100", color: selectedDevice === undefined ? "white" : "#81A938" }}
                userSelect="text"
            >
                <Icon as={FaHome} boxSize={4} />
                <Text fontWeight="semibold">
                    Home
                </Text>
            </Button>
            <DeviceList 
                title="Devices" 
                icon={FaNetworkWired}
                isSelected={selectedDevice !== undefined && !selectedDevice.template}
            >
                {devicesLoading && (
                    <Center p={4}>
                        <Spinner size="sm" />
                    </Center>
                )}
                {devicesError && (
                    <Text p={4} color="red.500" fontSize="sm">
                         Failed to load devices
                    </Text>
                )}
                <DeviceAddButton label="Add Device" onClick={() => console.log("Add new device")} />
                {!devicesLoading && devices.map((device) => (
                    <DeviceButton 
                        key={device.filename}
                        device={device}
                        isSelected={selectedDevice?.template === device.template && selectedDevice?.filename === device.filename}
                        onClick={() => onSelectDevice(device)}
                    />
                ))}
            </DeviceList>
            <DeviceList 
                title="Templates" 
                icon={FaBook}
                isSelected={selectedDevice !== undefined && selectedDevice.template === true}
            >
                {templatesLoading && (
                    <Center p={4}>
                        <Spinner size="sm" />
                    </Center>
                )}
                {templatesError && (
                    <Text p={4} color="red.500" fontSize="sm">
                         Failed to load templates
                    </Text>
                )}
                <DeviceAddButton label="Add Template" onClick={() => console.log("Add new template")} />
                {!templatesLoading && templates.map((template) => (
                    <DeviceButton 
                        key={template.filename}
                        device={template} 
                        showState={false}
                        isSelected={selectedDevice?.template === template.template && selectedDevice?.filename === template.filename}
                        onClick={() => onSelectDevice(template)}
                    />
                ))}
            </DeviceList>
        </>
    );
}

export default SideBar;