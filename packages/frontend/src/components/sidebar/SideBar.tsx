import { FaNetworkWired, FaBook } from "react-icons/fa";
import DeviceList from "./DeviceList";
import useDevices from "@/hooks/useDevices";
import DeviceButton from "./DeviceButton";
import useTemplates from "@/hooks/useTemplates";

function SideBar() {
    const { data: devices } = useDevices();
    const { data: templates } = useTemplates();

    return (
        <>
            <DeviceList title="Devices" icon={FaNetworkWired}>
                {devices.map((device) => (
                    <DeviceButton 
                        key={device.filename}
                        device={device} 
                    />
                ))}
            </DeviceList>
            <DeviceList title="Templates" icon={FaBook}>
                {templates.map((template) => (
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