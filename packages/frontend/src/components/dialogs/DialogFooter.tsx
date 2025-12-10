import { Button, Dialog, HStack } from "@chakra-ui/react";

interface Props {
  cancelBtnLabel?: string;
  confirmBtnLabel?: string;
  onClose?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  loadingText?: string;
}

const DialogFooter = ({
  cancelBtnLabel,
  confirmBtnLabel,
  onClose,
  onSubmit,
  loading,
  loadingText,
}: Props) => {
  return (
    <Dialog.Footer
      background="bg.medium"
      borderTop="1px"
      borderColor="bg.dark"
      borderStyle="solid"
      padding="16px 24px"
    >
      <HStack>
        <Button variant="outline" size="xl" onClick={() => onClose?.()}>
          {cancelBtnLabel || "Cancel"}
        </Button>
        <Button
          loading={loading ? true : undefined}
          loadingText={loadingText}
          variant="primary"
          size="xl"
          onClick={() => onSubmit?.()}
        >
          {confirmBtnLabel || "Confirm"}
        </Button>
      </HStack>
    </Dialog.Footer>
  );
};

export default DialogFooter;
