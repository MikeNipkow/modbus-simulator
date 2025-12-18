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
  const [unitIdInput, setUnitIdInput] = useState(unit.unitId.toString());

  // State to manage the new unit ID as number.
  const [newUnitId, setNewUnitId] = useState<number>(unit.unitId);

  // Hook for updating unit.
  const { updateUnit, isLoading } = useUpdateUnit();

  /**
   * Handle port input change and validation.
   * @param value New port value as string.
   */
  const handleUnitIdInput = (value: string) => {
    // Check if value can be parsed to number.
    const parsedValue = Number(value);
    if (value.length === 0 || isNaN(parsedValue)) {
      setUnitIdInput(newUnitId.toString());
      return;
    }

    // Check for valid unit id number.
    if (parsedValue < 1) {
      setUnitIdInput("1");
      setNewUnitId(1);
      return;
    }
    if (parsedValue > 254) {
      setUnitIdInput("254");
      setNewUnitId(254);
      return;
    }

    // Check if value is integer.
    if (!Number.isInteger(parsedValue)) {
      setUnitIdInput(Math.trunc(parsedValue).toString());
      setNewUnitId(Math.trunc(parsedValue));
      return;
    }

    setNewUnitId(parsedValue);
  };

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
    const result = await updateUnit(unit.unitId, device, {
      ...unit,
      unitId: newUnitId,
    });

    // Notify parent component to refresh data.
    if (result.success) onChange?.();

    // Show toast notification.
    result.success
      ? createSuccessToast({
          title: "Unit ID changed",
          description: `Modbus unit ID has been changed to ${newUnitId}.`,
        })
      : createErrorToast({
          title: "Failed to change Unit ID",
          description: result.errors,
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
          value={unitIdInput}
          onChange={(e) => setUnitIdInput(e.target.value)}
          onBlur={(e) => handleUnitIdInput(e.target.value)}
        />
      </Field.Root>
    </BaseDialog>
  );
};

export default ChangeUnitIdDialog;
