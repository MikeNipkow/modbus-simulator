import { Dialog } from "@chakra-ui/react";
import DialogHeader from "./DialogHeader";
import DialogFooter from "./DialogFooter";

interface Props {
  open: boolean;
  title?: string;
  onClose?: () => void;
  onSubmit?: () => void;
  loading?: boolean;
  loadingText?: string;
  cancelBtnLabel?: string;
  confirmBtnLabel?: string;
  children?: React.ReactNode;
}

const BaseDialog = ({
  open,
  title,
  onClose,
  onSubmit,
  loading,
  loadingText,
  cancelBtnLabel,
  confirmBtnLabel,
  children,
}: Props) => {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => (e.open ? undefined : onClose?.())}
      placement={"center"}
    >
      {/* Darken background */}
      <Dialog.Backdrop />

      {/* Required to position dialog in center */}
      <Dialog.Positioner>
        <Dialog.Content>
          {/* Header */}
          <DialogHeader title={title || ""} onClose={() => onClose?.()} />

          {/* Body */}
          <Dialog.Body padding="24px">{children}</Dialog.Body>

          {/* Footer */}
          <DialogFooter
            cancelBtnLabel={cancelBtnLabel}
            confirmBtnLabel={confirmBtnLabel}
            onClose={() => onClose?.()}
            onSubmit={() => onSubmit?.()}
            loading={loading}
            loadingText={loadingText}
          />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default BaseDialog;
