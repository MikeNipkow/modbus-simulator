import React, { type ComponentProps } from "react";
import SidebarButton from "./SidebarButton";
import { Icon, HStack } from "@chakra-ui/react";

interface Props extends ComponentProps<typeof SidebarButton> {
  icon: React.ElementType;
  iconSize?: string | number;
  label: string;
}

const SidebarIconButton = ({ icon, iconSize, label, ...props }: Props) => {
  return (
    <SidebarButton {...props}>
      <HStack gap="3" width="100%">
        <Icon boxSize={iconSize} as={icon} />
        <span>{label}</span>
      </HStack>
    </SidebarButton>
  );
};

export default SidebarIconButton;
