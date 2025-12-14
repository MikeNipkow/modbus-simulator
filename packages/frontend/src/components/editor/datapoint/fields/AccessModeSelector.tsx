import type { DataPoint } from "@/types/DataPoint";
import { AccessMode } from "@/types/enums/AccessMode";
import { createListCollection, Field, Select } from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  onSelect: (newDatapoint: DataPoint) => void;
}

const AccessModeSelector = ({ datapoint, onSelect }: Props) => {
  // Create collection of access modes.
  const accessModes = createListCollection({
    items: [
      { value: AccessMode.ReadOnly, label: "Read only" },
      { value: AccessMode.WriteOnly, label: "Write only" },
      { value: AccessMode.ReadWrite, label: "Read/Write" },
    ],
  });

  // Handle selection of new access mode.
  const handleSelect = (accessMode: AccessMode) => {
    // Create new datapoint with updated access mode.
    const newDatapoint: DataPoint = {
      ...datapoint,
      accessMode: accessMode,
    };

    // Notify parent component.
    onSelect(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>Access Mode</Field.Label>
      <Select.Root
        collection={accessModes}
        value={[datapoint.accessMode]}
        onSelect={(newAccessMode) =>
          handleSelect(newAccessMode.value as AccessMode)
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
  );
};

export default AccessModeSelector;
