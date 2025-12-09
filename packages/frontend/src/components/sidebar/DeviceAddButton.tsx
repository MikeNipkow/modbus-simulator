import { Button, Icon, Text } from "@chakra-ui/react";
import { FaPlus } from "react-icons/fa";

interface Props {
  title: string;
  onClick?: () => void;
}

const DeviceAddButton = ({ title, onClick }: Props) => {
  return (
    <Button
      variant={"sidebar"}
      paddingLeft={"20px"}
      borderLeft={"4px solid"}
      borderColor={"brand"}
      onClick={onClick}
    >
      <Icon as={FaPlus} boxSize={3} />
      <Text>{title}</Text>
    </Button>
  );
};

export default DeviceAddButton;
