import { useState } from "react";
import type { ComponentProps } from "react";
import SidebarButton from "./SidebarButton";
import { FaChevronRight, FaChevronDown } from "react-icons/fa";
import { Icon, VStack, HStack } from "@chakra-ui/react";

interface Props extends ComponentProps<typeof SidebarButton> {
  icon: React.ElementType;
  label: string;
}

const SidebarDropdownButton = ({ icon, label, children, ...props }: Props) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <SidebarButton {...props} onClick={() => setIsOpen(!isOpen)}>
        <HStack gap="3" width="100%">
          <Icon as={icon} />
          <span>{label}</span>
          <Icon
            as={isOpen ? FaChevronDown : FaChevronRight}
            marginLeft="auto"
          />
        </HStack>
      </SidebarButton>

      {isOpen && (
        <VStack
          width="100%"
          gap="0"
          borderLeft="3px"
          borderStyle="solid"
          borderColor="primary"
        >
          {children}
        </VStack>
      )}
    </>
  );
};

export default SidebarDropdownButton;
