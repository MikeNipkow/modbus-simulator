import { Dialog } from "@chakra-ui/react";
import DialogHeader from "./DialogHeader";
import DialogFooter from "./DialogFooter";

interface Props {
  open: boolean;
  title?: string;
  onClose?: () => void;
  onSubmit?: () => void;
  placement?: "center" | "top" | "bottom";
  headerColor?: string;
  headerBackground?: string;
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
  onClose,
  onSubmit,
  placement,
  headerColor,
  headerBackground,
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
      placement={placement || "center"}
    >
      {/* Darken background */}
      <Dialog.Backdrop />

      {/* Required to position dialog in center */}
      <Dialog.Positioner>
        <Dialog.Content>
          {/* Header */}
          <DialogHeader
            title={title || ""}
            onClose={() => onClose?.()}
            color={headerColor}
            background={headerBackground}
          />

          {/* Body */}
          <Dialog.Body padding="24px">{children}</Dialog.Body>

          {/* Footer */}
          <DialogFooter
            cancelBtnLabel={cancelBtnLabel}
            confirmBtnLabel={confirmBtnLabel}
            confirmBtnVariant={confirmBtnVariant}
            confirmBtnColorPalette={confirmBtnColorPalette}
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
