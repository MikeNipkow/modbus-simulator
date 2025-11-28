import { Box } from "@chakra-ui/react";
import { useState, type ElementType, type ReactNode } from "react";
import DeviceListButton from "./DeviceListButton";

interface DeviceListProps {
    title: string;
    icon: ElementType;
    children: ReactNode;
}

function DeviceList({ title, icon, children }: DeviceListProps) {
    const [isOpen, setIsOpen] = useState(true);

    return (
        <Box>
            <DeviceListButton 
                title={title}
                icon={icon}
                isOpen={isOpen} 
                onClick={() => setIsOpen(!isOpen)} 
            />
            {isOpen && children}
        </Box>
    );
}

export default DeviceList;
