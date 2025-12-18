import type { DataPoint } from "@/types/DataPoint";
import { Field, Input, Text } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const DatapointLengthInput = ({ datapoint, onChange }: Props) => {
  // State to manage length input as string.
  const [lengthInput, setLengthInput] = useState<string>(
    datapoint.length?.toString() || "1",
  );

  // Handle change of length input.
  const handleChange = (value: string) => {
    // Check if value can be parsed to number.
    const parsedValue = Number(value);
    if (value.length === 0 || isNaN(parsedValue)) {
      setLengthInput(datapoint.length?.toString() || "1");
      return;
    }

    // Validate length.
    if (parsedValue < 1) {
      setLengthField(1);
      setLengthInput("1");
      return;
    }
    if (parsedValue > 16) {
      setLengthField(16);
      setLengthInput("16");
      return;
    }

    // Check if value is integer.
    if (!Number.isInteger(parsedValue)) {
      setLengthField(Math.trunc(parsedValue));
      setLengthInput(Math.trunc(parsedValue).toString());
      return;
    }

    // Notify parent component.
    setLengthField(parsedValue);
  };

  const setLengthField = (length: number) => {
    const newDatapoint: DataPoint = {
      ...datapoint,
      length: length,
    };

    // Adjust defaultValue and value according to new length.
    if (
      typeof newDatapoint.defaultValue !== "string" ||
      typeof newDatapoint.value !== "string"
    ) {
      newDatapoint.defaultValue = "";
      newDatapoint.value = "";
    } else if (newDatapoint.defaultValue.length > length * 2) {
      newDatapoint.defaultValue = newDatapoint.defaultValue.slice(
        0,
        length * 2,
      );
      newDatapoint.value = newDatapoint.value.slice(0, length * 2);
    }

    onChange(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>
        Length <Text color="red">*</Text>
      </Field.Label>
      <Input
        type="number"
        value={lengthInput}
        onChange={(e) => setLengthInput(e.target.value)}
        onBlur={(e) => handleChange(e.target.value)}
      ></Input>
    </Field.Root>
  );
};

export default DatapointLengthInput;
