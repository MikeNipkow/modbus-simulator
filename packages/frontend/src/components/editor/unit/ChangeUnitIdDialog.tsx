import { useState } from "react";
import { Field, Input } from "@chakra-ui/react";
import BaseDialog from "@/components/dialogs/base/BaseDialog";

interface Props {
  open: boolean;
  unitId?: number;
  loading?: boolean;
  onClose?: () => void;
  onSubmit?: (newUnitId: number) => void;
}

const ChangeUnitIdDialog = ({
  open,
  unitId,
  loading,
  onClose,
  onSubmit,
}: Props) => {
  const [newUnitId, setNewUnitId] = useState<number>(unitId ?? 1);

  return (
    <BaseDialog
      title="Edit Unit-ID"
      open={open}
      onClose={onClose}
      onSubmit={() =>
        unitId === newUnitId ? onClose?.() : onSubmit?.(newUnitId)
      }
      loading={loading}
    >
      <Field.Root>
        <Field.Label>Unit-ID</Field.Label>
        <Input
          type="number"
          value={newUnitId}
          onChange={(e) =>
            1 <= Number(e.target.value) && Number(e.target.value) <= 254
              ? setNewUnitId(Number(e.target.value))
              : null
          }
        />
      </Field.Root>
    </BaseDialog>
  );
};

export default ChangeUnitIdDialog;
