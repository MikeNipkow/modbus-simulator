import type { DataPoint } from "@/types/DataPoint";
import { Field, Input, Text } from "@chakra-ui/react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const DatapointAddressInput = ({ datapoint, onChange }: Props) => {
  // Handle change of address input.
  const handleChange = (value: number) => {
    // Validate address.
    if (value < 0) value = 0;
    if (value > 65535) value = 65535;

    // Update datapoint address.
    const newDatapoint: DataPoint = {
      ...datapoint,
      address: value,
    };

    // Notify parent component.
    onChange(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>
        Address <Text color="red">*</Text>
      </Field.Label>
      <Input
        value={datapoint.address}
        type="number"
        onChange={(e) => handleChange(Number(e.target.value))}
      ></Input>
    </Field.Root>
  );
};

export default DatapointAddressInput;
