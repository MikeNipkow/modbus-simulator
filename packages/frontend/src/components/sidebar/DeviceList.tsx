import { Box } from "@chakra-ui/react";
import { useState, useRef, useEffect, type ElementType, type ReactNode } from "react";
import DeviceListButton from "./DeviceListButton";

interface DeviceListProps {
    title: string;
    icon: ElementType;
    children: ReactNode;
}

function DeviceList({ title, icon, children }: DeviceListProps) {
    const [isOpen, setIsOpen] = useState(true);
    const [height, setHeight] = useState<number>(0);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (contentRef.current) {
            setHeight(contentRef.current.scrollHeight);
        }
    }, [children]);

    return (
        <>
            <DeviceListButton 
                title={title}
                icon={icon}
                isOpen={isOpen} 
                onClick={() => setIsOpen(!isOpen)} 
            />
            <Box
                overflow="hidden"
                maxHeight={isOpen ? `${height}px` : "0"}
                transition="max-height 0.2s linear"
            >
                <div ref={contentRef}>
                    {children}
                </div>
            </Box>
        </>
    );
}

export default DeviceList;
