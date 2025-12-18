import type { DataPoint } from "@/types/DataPoint";
import { Field, Input, Text } from "@chakra-ui/react";
import { useState } from "react";

interface Props {
  datapoint: DataPoint;
  onChange: (newDatapoint: DataPoint) => void;
}

const DatapointAddressInput = ({ datapoint, onChange }: Props) => {
  // State to manage address input as string.
  const [addressInput, setAddressInput] = useState<string>(
    datapoint.address.toString(),
  );

  // Handle change of address input.
  const handleChange = (value: string) => {
    // Check if value can be parsed to number.
    const parsedValue = Number(value);
    if (value.length === 0 || isNaN(parsedValue)) {
      setAddressInput(datapoint.address.toString());
      return;
    }

    // Check for valid port number.
    if (parsedValue < 0) {
      setAddressField(0);
      setAddressInput("0");
      return;
    }
    if (parsedValue > 65535) {
      setAddressField(65535);
      setAddressInput("65535");
      return;
    }

    // Check if value is integer.
    if (!Number.isInteger(parsedValue)) {
      setAddressField(Math.trunc(parsedValue));
      setAddressInput(Math.trunc(parsedValue).toString());
      return;
    }

    setAddressField(parsedValue);
  };

  /**
   * Set address field in datapoint.
   * @param address New address value.
   */
  const setAddressField = (address: number) => {
    const newDatapoint: DataPoint = {
      ...datapoint,
      address: address,
    };

    onChange(newDatapoint);
  };

  return (
    <Field.Root>
      <Field.Label>
        Address <Text color="red">*</Text>
      </Field.Label>
      <Input
        value={addressInput}
        type="number"
        onChange={(e) => setAddressInput(e.target.value)}
        onBlur={(e) => handleChange(e.target.value)}
      ></Input>
    </Field.Root>
  );
};

export default DatapointAddressInput;
