import { Dialog } from "@chakra-ui/react";
import DialogHeader from "./DialogHeader";
import DialogFooter from "./DialogFooter";

interface Props {
  open: boolean;
  title?: string;
  submitDisabled?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
  placement?: "center" | "top" | "bottom";
  loading?: boolean;
  loadingText?: string;
  cancelBtnLabel?: string;
  confirmBtnLabel?: string;
  confirmBtnVariant?:
    | "solid"
    | "subtle"
    | "surface"
    | "outline"
    | "ghost"
    | "plain"
    | "primary"
    | "secondary";
  confirmBtnColorPalette?: string;
  children?: React.ReactNode;
}

const BaseDialog = ({
  open,
  title,
  submitDisabled,
  onClose,
  onSubmit,
  placement,
  loading,
  loadingText,
  cancelBtnLabel,
  confirmBtnLabel,
  confirmBtnVariant,
  confirmBtnColorPalette,
  children,
}: Props) => {
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => (e.open ? undefined : onClose?.())}
      placement={placement || "top"}
    >
      {/* Darken background */}
      <Dialog.Backdrop bg="blackAlpha.600" />

      {/* Required to position dialog in center */}
      <Dialog.Positioner>
        <Dialog.Content
          borderRadius="xl"
          boxShadow={"2xl"}
          overflow={"hidden"}
          border="3px"
          borderStyle="solid"
          borderColor="primary"
          background="primary"
        >
          {/* Header */}
          <DialogHeader title={title || ""} onClose={() => onClose?.()} />

          {/* Body */}
          <Dialog.Body
            borderTopRadius={"lg"}
            background={"bg.light"}
            padding="24px"
          >
            {children}
          </Dialog.Body>

          {/* Footer */}
          <DialogFooter
            cancelBtnLabel={cancelBtnLabel}
            confirmBtnLabel={confirmBtnLabel}
            confirmBtnVariant={confirmBtnVariant}
            confirmBtnColorPalette={confirmBtnColorPalette}
            submitDisabled={submitDisabled}
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
