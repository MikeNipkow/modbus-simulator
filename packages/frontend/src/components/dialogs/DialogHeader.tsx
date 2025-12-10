import { Dialog, HStack, CloseButton, Text } from "@chakra-ui/react";

interface Props {
  title: string;
  onClose?: () => void;
}

const DialogHeader = ({ title, onClose }: Props) => {
  return (
    <Dialog.Header
      background={"primary"}
      color={"primary.contrast"}
      padding={"24px"}
    >
      <Dialog.Title width={"100%"}>
        <HStack justifyContent={"space-between"}>
          <Text>{title}</Text>
          <CloseButton
            color="primary.contrast"
            _hover={{ bg: "whiteAlpha.300" }}
            onClick={onClose}
          />
        </HStack>
      </Dialog.Title>
    </Dialog.Header>
  );
};

export default DialogHeader;
