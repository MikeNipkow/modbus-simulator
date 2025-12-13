import type { DataPoint } from "@/types/DataPoint";
import BaseDialog from "./base/BaseDialog";
import useUpdateDatapoint from "@/hooks/useUpdateDatapoint";
import { useState } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { createErrorToast, createSuccessToast } from "../ui/Toaster";
import {
  Checkbox,
  createListCollection,
  Field,
  Input,
  NativeSelect,
  Select,
} from "@chakra-ui/react";
import { DataType } from "@/types/enums/DataType";
import { DataArea } from "@/types/enums/DataArea";
import { AccessMode } from "@/types/enums/AccessMode";
import {
  getDefaultValueForType,
  getMaxValueForType,
  getMinValueForType,
} from "@/util/modbusUtils";
import { deserializeValue, serializeValue } from "@/util/jsonUtils";
import type { ModbusUnit } from "@/types/ModbusUnit";
import useCreateDatapoint from "@/hooks/useCreateDatapoint";

interface Props {
  device: ModbusDevice;
  unit: ModbusUnit;
  datapoint?: DataPoint;
  open: boolean;
  onClose?: (update: boolean) => void;
}

const dataTypes = createListCollection({
  items: Object.values(DataType).map((type) => ({
    value: type.toString(),
    label: type.toString(),
  })),
});
const dataAreas = createListCollection({
  items: Object.values(DataArea).map((area) => ({
    value: area,
    label: area,
  })),
});
const registerAreas = createListCollection({
  items: [DataArea.HoldingRegister, DataArea.InputRegister].map((area) => ({
    value: area,
    label: area,
  })),
});
const accessModes = createListCollection({
  items: [
    { value: AccessMode.ReadOnly, label: "Read only" },
    { value: AccessMode.WriteOnly, label: "Write only" },
    { value: AccessMode.ReadWrite, label: "Read/Write" },
  ],
});

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

  const {
    updateDatapoint,
    isLoading: updatingDatapoint,
    errors: updateErrors,
  } = useUpdateDatapoint();
  const {
    createDatapoint,
    isLoading: creatingDatapoint,
    errors: createErrors,
  } = useCreateDatapoint();

  const setField = (field: keyof DataPoint, value: any) => {
    setEditDatapoint({ ...editDatapoint, [field]: value });
  };

  const setType = (type: DataType) => {
    const defaultValue = serializeValue(getDefaultValueForType(type));
    setEditDatapoint({
      ...editDatapoint,
      type: type,
      defaultValue: defaultValue,
      value: defaultValue,
    });
  };

  const setDefaultValue = (value: any) => {
    const serializedValue = serializeValue(value);
    setEditDatapoint({
      ...editDatapoint,
      defaultValue: serializedValue,
      value: serializedValue,
    });
  };

  const handleSubmit = () => {
    datapoint !== undefined ? handleUpdate() : handleCreate();
  };

  const handleUpdate = async () => {
    // Call the update function from the hook.
    const success = await updateDatapoint(device, unit.unitId, editDatapoint);

    // If successful, close the dialog and indicate an update occurred.
    if (success) onClose?.(true);

    // Show appropriate toast notification.
    success
      ? createSuccessToast({ title: "Datapoint updated" })
      : createErrorToast({
          title: "Failed to update datapoint",
          description: updateErrors,
        });
  };

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
    const success = await createDatapoint(device, unit.unitId, editDatapoint);

    // If successful, close the dialog and indicate an update occurred.
    if (success) onClose?.(true);

    // Show appropriate toast notification.
    success
      ? createSuccessToast({ title: "Datapoint created" })
      : createErrorToast({
          title: "Failed to create datapoint",
          description: createErrors,
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
      <Field.Root>
        <Field.Label>Name</Field.Label>
        <Input
          value={editDatapoint.name}
          onChange={(e) => setField("name", e.target.value)}
        ></Input>
      </Field.Root>

      <Field.Root>
        <Field.Label>Type</Field.Label>
        <Select.Root
          collection={dataTypes}
          value={[editDatapoint.type]}
          onSelect={(newType) => {
            const type = newType.value as DataType;
            setType(type);
          }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {dataTypes.items.map((type) => (
                <Select.Item item={type} key={type.value}>
                  {type.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>Areas</Field.Label>
        <Select.Root
          multiple
          collection={
            editDatapoint.type === DataType.Bool ? dataAreas : registerAreas
          }
          value={editDatapoint.areas}
          onSelect={(area) => {
            const included = editDatapoint.areas.includes(
              area.value as DataArea,
            );
            const newAreas = included
              ? editDatapoint.areas.filter((a) => a !== area.value)
              : [...editDatapoint.areas, area.value as DataArea];
            setField("areas", newAreas);
          }}
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {(editDatapoint.type === DataType.Bool
                ? dataAreas
                : registerAreas
              ).items.map((area) => (
                <Select.Item item={area} key={area.value}>
                  {area.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>Address</Field.Label>
        <Input
          value={editDatapoint.address}
          type="number"
          onChange={(e) => {
            const address = Number(e.target.value);
            if (address >= 0 && address <= 65535) setField("address", address);
          }}
        ></Input>
      </Field.Root>

      <Field.Root>
        <Field.Label>Access</Field.Label>
        <Select.Root
          collection={accessModes}
          value={[editDatapoint.accessMode]}
          onSelect={(newAccessMode) =>
            setField("accessMode", newAccessMode.value)
          }
        >
          <Select.HiddenSelect />
          <Select.Control>
            <Select.Trigger>
              <Select.ValueText />
            </Select.Trigger>
            <Select.IndicatorGroup>
              <Select.Indicator />
            </Select.IndicatorGroup>
          </Select.Control>
          <Select.Positioner>
            <Select.Content>
              {accessModes.items.map((accessMode) => (
                <Select.Item item={accessMode} key={accessMode.value}>
                  {accessMode.label}
                  <Select.ItemIndicator />
                </Select.Item>
              ))}
            </Select.Content>
          </Select.Positioner>
        </Select.Root>
      </Field.Root>

      <Field.Root>
        <Field.Label>Default Value</Field.Label>
        {editDatapoint.type !== DataType.ASCII &&
          editDatapoint.type !== DataType.Bool && (
            <Input
              type="number"
              value={editDatapoint.defaultValue as number}
              onChange={(e) => {
                const value = deserializeValue(e.target.value);
                if (typeof value !== "number" && typeof value !== "bigint")
                  return;

                const minAllowedValue = getMinValueForType(editDatapoint.type);
                const maxAllowedValue = getMaxValueForType(editDatapoint.type);

                if (value < minAllowedValue || value > maxAllowedValue) return;
                setDefaultValue(value);
              }}
            ></Input>
          )}
        {editDatapoint.type === DataType.Bool && (
          <NativeSelect.Root>
            <NativeSelect.Field
              value={editDatapoint.defaultValue as string}
              onChange={(e) => setDefaultValue(e.target.value === "true")}
            >
              <option value="true">true</option>
              <option value="false">false</option>
            </NativeSelect.Field>
          </NativeSelect.Root>
        )}
        {editDatapoint.type === DataType.ASCII && (
          <Input
            placeholder={`max. ${editDatapoint.length! * 2} characters`}
            value={editDatapoint.defaultValue as string}
            onChange={(e) => {
              const value = e.target.value;
              if (value.length <= editDatapoint.length! * 2)
                setDefaultValue(e.target.value);
            }}
          ></Input>
        )}
      </Field.Root>
      <Field.Root>
        <Field.Label>Unit</Field.Label>
        <Input
          value={editDatapoint.unit}
          onChange={(e) => setField("unit", e.target.value)}
        ></Input>
      </Field.Root>

      {editDatapoint.type === DataType.ASCII && (
        <Field.Root>
          <Field.Label>Length</Field.Label>
          <Input
            type="number"
            value={editDatapoint.length || 1}
            onChange={(e) => {
              const length = Number(e.target.value);
              if (length >= 1 && length <= 8) setField("length", length);
            }}
          ></Input>
        </Field.Root>
      )}

      {editDatapoint.type !== DataType.ASCII && (
        <Field.Root>
          <Field.Label>Simulation</Field.Label>
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
      )}

      {editDatapoint.type !== DataType.Bool &&
        editDatapoint.simulation?.enabled && (
          <>
            <Field.Root>
              <Field.Label>Min Value</Field.Label>
              <Input
                type="number"
                value={editDatapoint.simulation?.minValue}
                onChange={(e) => {
                  const minValue = Number(e.target.value);
                  const minAllowedValue = getMinValueForType(
                    editDatapoint.type,
                  );
                  const maxAllowedValue = getMaxValueForType(
                    editDatapoint.type,
                  );

                  if (
                    minValue >= editDatapoint.simulation!.maxValue ||
                    minValue < minAllowedValue ||
                    minValue > maxAllowedValue
                  )
                    return;

                  setField("simulation", {
                    ...editDatapoint.simulation,
                    minValue: Number(e.target.value),
                  });
                }}
              ></Input>
            </Field.Root>

            <Field.Root>
              <Field.Label>Max Value</Field.Label>
              <Input
                type="number"
                value={editDatapoint.simulation?.maxValue}
                onChange={(e) => {
                  const maxValue = Number(e.target.value);
                  const minAllowedValue = getMinValueForType(
                    editDatapoint.type,
                  );
                  const maxAllowedValue = getMaxValueForType(
                    editDatapoint.type,
                  );

                  if (
                    maxValue <= editDatapoint.simulation!.minValue ||
                    maxValue < minAllowedValue ||
                    maxValue > maxAllowedValue
                  )
                    return;

                  setField("simulation", {
                    ...editDatapoint.simulation,
                    maxValue: Number(e.target.value),
                  });
                }}
              ></Input>
            </Field.Root>
          </>
        )}
    </BaseDialog>
  );
};

export default DatapointEditDialog;
