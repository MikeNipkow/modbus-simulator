import { FaNetworkWired, FaBook } from "react-icons/fa";
import DeviceList from "./DeviceList";
import useDevices from "@/hooks/useDevices";
import DeviceButton from "./DeviceButton";
import useTemplates from "@/hooks/useTemplates";
import { Center, Spinner, Text } from "@chakra-ui/react";

function SideBar() {
    const { data: devices, error: devicesError, isLoading: devicesLoading } = useDevices();
    const { data: templates, error: templatesError, isLoading: templatesLoading } = useTemplates();

    return (
        <>
            <DeviceList title="Devices" icon={FaNetworkWired}>
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
                {!devicesLoading && devices.map((device) => (
                    <DeviceButton 
                        key={device.filename}
                        device={device} 
                    />
                ))}
            </DeviceList>
            <DeviceList title="Templates" icon={FaBook}>
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
                {!templatesLoading && templates.map((template) => (
                    <DeviceButton 
                        key={template.filename}
                        device={template} 
                        showState={false}
                    />
                ))}
            </DeviceList>
        </>
    );
}

export default SideBar;