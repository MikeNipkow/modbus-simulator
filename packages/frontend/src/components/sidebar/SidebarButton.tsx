import { Button, Icon, Text } from "@chakra-ui/react";
import type { IconType } from "react-icons";

interface Props {
  icon: IconType;
  text: string;
  onClick?: () => void;
}

const SidebarButton = ({ icon, text, onClick }: Props) => {
  return (
    <Button variant={"sidebar"} onClick={onClick}>
      <Icon as={icon} boxSize={4} />
      <Text>{text}</Text>
    </Button>
  );
};

export default SidebarButton;
