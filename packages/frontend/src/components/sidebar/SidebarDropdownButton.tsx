import { Box, Button, Icon, Spacer, Text } from "@chakra-ui/react";
import { useEffect, useRef, useState } from "react";
import type { IconType } from "react-icons";
import { FaChevronRight } from "react-icons/fa";

interface Props {
  icon: IconType;
  text: string;
  isOpen?: boolean;
  children?: React.ReactNode;
}

const SidebarDropdownButton = ({ icon, text, isOpen, children }: Props) => {
  const [open, setOpen] = useState(isOpen);
  const [height, setHeight] = useState<number>(0);

  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight);
    }
  }, [children]);

  return (
    <>
      <Button variant={"sidebar"} onClick={() => setOpen(!open)}>
        <Icon as={icon} />
        <Text>{text}</Text>
        <Spacer />
        <Icon
          as={FaChevronRight}
          transform={open ? "rotate(90deg)" : "rotate(0deg)"}
          transition="0.1s linear"
        />
      </Button>
      <Box
        ref={contentRef}
        maxHeight={open ? `${height}px` : "0"}
        transition="0.1s linear"
        overflow="hidden"
      >
        {children}
      </Box>
    </>
  );
};

export default SidebarDropdownButton;
