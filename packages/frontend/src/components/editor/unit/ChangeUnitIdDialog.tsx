import { useState } from "react";
import { Field, Input } from "@chakra-ui/react";
import BaseDialog from "@/components/ui/dialogs/base/BaseDialog";
import useUpdateUnit from "@/hooks/unit/useUpdateUnit";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { createErrorToast, createSuccessToast } from "@/components/ui/Toaster";
import type { ModbusUnit } from "@/types/ModbusUnit";

interface Props {
  open: boolean;
  device: ModbusDevice;
  unit: ModbusUnit;
  loading?: boolean;
  onClose?: () => void;
  onChange?: () => void;
}

const ChangeUnitIdDialog = ({
  open,
  device,
  unit,
  onClose,
  onChange,
}: Props) => {
  // State to manage the new unit ID input.
  const [newUnitId, setNewUnitId] = useState<number>(unit.unitId);

  // Hook for updating unit.
  const { updateUnit, isLoading, errors } = useUpdateUnit();

  /**
   * Handle changing the unit ID.
   * @param newUnitId The new unit ID to set.
   */
  const handleUnitIdChange = async () => {
    if (newUnitId === unit.unitId) {
      onClose?.();
      return;
    }

    // Call update unit hook.
    const success = await updateUnit(unit.unitId, device, {
      ...unit,
      unitId: newUnitId,
    });

    // Notify parent component to refresh data.
    if (success) onChange?.();

    // Show toast notification.
    success
      ? createSuccessToast({
          title: "Unit ID changed",
          description: `Modbus unit ID has been changed to ${newUnitId}.`,
        })
      : createErrorToast({
          title: "Failed to change Unit ID",
          description: errors,
        });
  };

  return (
    <BaseDialog
      title="Edit Unit-ID"
      open={open}
      onClose={onClose}
      onSubmit={handleUnitIdChange}
      loading={isLoading}
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
