import type { DataPoint } from "@/types/DataPoint";
import { Field, Input, Text } from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const DatapointLengthInput = ({ datapoint, onChange }: Props) => {
  // Handle change of length input.
  const handleChange = (value: number) => {
    // Validate length.
    if (value < 1) value = 1;
    if (value > 16) value = 16;

    // Update datapoint length.
    const newDatapoint: DataPoint = {
      ...datapoint,
      length: value,
    };

    // Adjust defaultValue and value according to new length.
    if (
      typeof newDatapoint.defaultValue !== "string" ||
      typeof newDatapoint.value !== "string"
    ) {
      newDatapoint.defaultValue = "";
      newDatapoint.value = "";
    } else if (newDatapoint.defaultValue.length > value * 2) {
      newDatapoint.defaultValue = newDatapoint.defaultValue.slice(0, value * 2);
      newDatapoint.value = newDatapoint.value.slice(0, value * 2);
    }

    // Notify parent component.
    onChange(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>
        Length <Text color="red">*</Text>
      </Field.Label>
      <Input
        type="number"
        value={datapoint.length || 1}
        onChange={(e) => handleChange(Number(e.target.value))}
      ></Input>
    </Field.Root>
  );
};

export default DatapointLengthInput;
