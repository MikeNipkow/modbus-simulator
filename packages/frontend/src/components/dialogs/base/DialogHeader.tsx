import { Dialog, HStack, CloseButton, Text } from "@chakra-ui/react";

interface Props {
  title: string;
  onClose: () => void;
}

const DialogHeader = ({ title, onClose }: Props) => {
  return (
    <Dialog.Header background={"brand"} color={"white"} padding={"24px"}>
      <Dialog.Title width={"100%"}>
        <HStack justifyContent={"space-between"}>
          <Text>{title}</Text>
          <CloseButton
            onClick={onClose}
            color={"white"}
            _hover={{ bg: "whiteAlpha.300" }}
          />
        </HStack>
      </Dialog.Title>
    </Dialog.Header>
  );
};

export default DialogHeader;
