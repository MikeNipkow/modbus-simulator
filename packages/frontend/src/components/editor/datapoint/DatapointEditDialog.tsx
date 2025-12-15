import type { DataPoint } from "@/types/DataPoint";
import BaseDialog from "../../ui/dialogs/base/BaseDialog";
import useUpdateDatapoint from "@/hooks/datapoint/useUpdateDatapoint";
import { useState } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { createErrorToast, createSuccessToast } from "../../ui/Toaster";
import { Box, Checkbox, Field, HStack, Input, VStack } from "@chakra-ui/react";
import { DataType } from "@/types/enums/DataType";
import { DataArea } from "@/types/enums/DataArea";
import { AccessMode } from "@/types/enums/AccessMode";
import type { ModbusUnit } from "@/types/ModbusUnit";
import useCreateDatapoint from "@/hooks/datapoint/useCreateDatapoint";
import LabeledSeparator from "../../ui/LabeledSeparator";
import DataTypeSelector from "./fields/DataTypeSelector";
import DatapointLengthInput from "./fields/DatapointLengthInput";
import DatapointAddressInput from "./fields/DatapointAddressInput";
import DataAreaSelector from "./fields/DataAreaSelector";
import DefaultValueInput from "./fields/DefaultValueInput";
import AccessModeSelector from "./fields/AccessModeSelector";
import MinValueInput from "./fields/MinValueInput";
import MaxValueInput from "./fields/MaxValueInput";
import FeedbackDatapointSelector from "./fields/FeedbackDatapointSelector";

interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  datapoint?: DataPoint;
  open: boolean;
  onClose?: (update: boolean) => void;
}

const DatapointEditDialog = ({
  device,
  unit,
  datapoint,
  open,
  onClose,
}: Props) => {
  const [editDatapoint, setEditDatapoint] = useState<DataPoint>(
    datapoint || {
      id: "",
      name: "",
      type: DataType.UInt16,
      areas: [DataArea.HoldingRegister],
      address: 0,
      accessMode: AccessMode.ReadWrite,
      defaultValue: 0,
      value: 0,
      unit: "",
      simulation: { enabled: false, minValue: 0, maxValue: 1 },
    },
  );
  // Show advanced settings state.
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

  // Custom hooks for creating and updating datapoints.
  const { updateDatapoint, isLoading: updatingDatapoint } =
    useUpdateDatapoint();
  const { createDatapoint, isLoading: creatingDatapoint } =
    useCreateDatapoint();

  // Helper function to set a field in the editDatapoint state.
  const setField = (field: keyof DataPoint, value: any) => {
    setEditDatapoint({ ...editDatapoint, [field]: value });
  };

  // Handle form submission.
  const handleSubmit = () => {
    datapoint !== undefined ? handleUpdate() : handleCreate();
  };

  // Handle updating an existing datapoint.
  const handleUpdate = async () => {
    // Call the update function from the hook.
    const result = await updateDatapoint(device, unit.unitId, editDatapoint);

    // If successful, close the dialog and indicate an update occurred.
    if (result.success) onClose?.(true);

    // Show appropriate toast notification.
    result.success
      ? createSuccessToast({ title: "Datapoint updated" })
      : createErrorToast({
          title: "Failed to update datapoint",
          description: result.errors,
        });
  };

  // Handle creating a new datapoint.
  const handleCreate = async () => {
    // Set the id to a new unique value if creating a new datapoint.
    if (editDatapoint.id === "")
      editDatapoint.id = editDatapoint.areas[0] + "_" + editDatapoint.address;

    // Check if a datapoint with the same id already exists. If so, append a number to make it unique.
    for (
      let i = 1;
      i < 100 && unit.dataPoints?.some((dp) => dp.id === editDatapoint.id);
      i++
    )
      editDatapoint.id =
        editDatapoint.areas[0] + "_" + editDatapoint.address + "_" + i;

    // Call the update function from the hook.
    const result = await createDatapoint(device, unit.unitId, editDatapoint);

    // If successful, close the dialog and indicate an update occurred.
    if (result.success) onClose?.(true);

    // Show appropriate toast notification.
    result.success
      ? createSuccessToast({ title: "Datapoint created" })
      : createErrorToast({
          title: "Failed to create datapoint",
          description: result.errors,
        });
  };

  return (
    <BaseDialog
      open={open}
      title={datapoint ? "Edit Datapoint" : "Create Datapoint"}
      loading={device !== undefined ? updatingDatapoint : creatingDatapoint}
      onSubmit={handleSubmit}
      onClose={() => onClose?.(false)}
    >
      {/* Datapoint name */}
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input
          value={editDatapoint.name}
          onChange={(e) => setField("name", e.target.value)}
        ></Input>
      </Field.Root>

      <LabeledSeparator label="Data Type" />
      <HStack width={"100%"}>
        {/* Data Type select */}
        <DataTypeSelector
          datapoint={editDatapoint}
          onSelect={(newDatapoint) => setEditDatapoint(newDatapoint)}
        />

        {/* Datapoint length for ASCII Data Type */}
        {editDatapoint.type === DataType.ASCII && (
          <DatapointLengthInput
            datapoint={editDatapoint}
            onChange={(newDatapoint) => setEditDatapoint(newDatapoint)}
          />
        )}
      </HStack>

      <LabeledSeparator label="Address" />
      <HStack width={"100%"}>
        {/* Address Input */}
        <DatapointAddressInput
          datapoint={editDatapoint}
          onChange={(newDatapoint) => setEditDatapoint(newDatapoint)}
        />

        {/* Areas Select */}
        <DataAreaSelector
          datapoint={editDatapoint}
          onSelect={(newDatapoint) => setEditDatapoint(newDatapoint)}
        />
      </HStack>

      <LabeledSeparator label="Advanced" />
      <Checkbox.Root
        checked={showAdvancedSettings}
        onCheckedChange={() => setShowAdvancedSettings(!showAdvancedSettings)}
      >
        <Checkbox.HiddenInput />
        <Checkbox.Control />
        <Checkbox.Label>Show advanced settings</Checkbox.Label>
      </Checkbox.Root>

      {showAdvancedSettings && (
        <Box>
          <LabeledSeparator label="Value" />
          <HStack>
            {/* Default Value */}
            <DefaultValueInput
              datapoint={editDatapoint}
              onChange={(newDatapoint) => setEditDatapoint(newDatapoint)}
            />

            {/* Unit */}
            <Field.Root>
              <Field.Label>Unit</Field.Label>
              <Input
                value={editDatapoint.unit}
                onChange={(e) => setField("unit", e.target.value)}
              ></Input>
            </Field.Root>

            {/* Access Mode */}
            {(editDatapoint.areas.includes(DataArea.HoldingRegister) ||
              editDatapoint.areas.includes(DataArea.Coil)) && (
              <AccessModeSelector
                datapoint={editDatapoint}
                onSelect={(newDatapoint) => setEditDatapoint(newDatapoint)}
              />
            )}
          </HStack>

          {editDatapoint.type !== DataType.ASCII && (
            <>
              <LabeledSeparator label="Simulation" />
              <VStack gap={4}>
                {/* Simulation active */}
                <Field.Root>
                  <Checkbox.Root
                    checked={editDatapoint.simulation?.enabled}
                    onCheckedChange={({ checked }) =>
                      setField("simulation", {
                        ...editDatapoint.simulation,
                        enabled: checked,
                      })
                    }
                  >
                    <Checkbox.HiddenInput />
                    <Checkbox.Control />
                    <Checkbox.Label>Active</Checkbox.Label>
                  </Checkbox.Root>
                </Field.Root>

                {/* Edit simulation range for number types */}
                {editDatapoint.type !== DataType.Bool &&
                  editDatapoint.simulation?.enabled && (
                    <HStack width="100%">
                      {/* Min Value */}
                      <MinValueInput
                        datapoint={editDatapoint}
                        onChange={(newDatapoint) =>
                          setEditDatapoint(newDatapoint)
                        }
                      />

                      {/* Max Value */}
                      <MaxValueInput
                        datapoint={editDatapoint}
                        onChange={(newDatapoint) =>
                          setEditDatapoint(newDatapoint)
                        }
                      />
                    </HStack>
                  )}
              </VStack>
            </>
          )}

          {/* Feedback Datapoint */}
          {editDatapoint.accessMode !== AccessMode.ReadOnly && (
            <>
              <LabeledSeparator label="Feedback" />
              <FeedbackDatapointSelector
                datapoint={editDatapoint}
                datapoints={unit.dataPoints}
                onSelect={(newDatapoint) => setEditDatapoint(newDatapoint)}
              />
            </>
          )}
        </Box>
      )}
    </BaseDialog>
  );
};

export default DatapointEditDialog;
