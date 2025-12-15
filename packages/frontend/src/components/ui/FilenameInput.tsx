import { isValidFilename } from "@/util/fileUtils";
import { Field, Input, InputGroup, Text } from "@chakra-ui/react";
import React, { useState } from "react";

interface Props {
  filename: string;
  onChange: (args: { filename: string; valid: boolean }) => void;
  onSubmit?: () => void;
}

const FilenameInput = ({ filename, onChange, onSubmit }: Props) => {
  // State to manage filename error.
  const [error, setError] = useState("");

  /**
   * Check if there is a filename error.
   * @returns Boolean indicating if there is an error.
   */
  const hasFilenameError = (): boolean => error !== "";

  /**
   * Validate filename and set error state
   * @param value Filename to validate
   * @return Boolean indicating if filename is valid
   */
  const validateFilename = (value: string): boolean => {
    let error = "";
    if (value.trim() == ".json") error = "Filename cannot be empty";
    else if (!isValidFilename(value)) error = "Invalid filename";
    else if (!value.endsWith(".json")) error = 'Filename must end with ".json"';

    setError(error);
    return error !== "" ? false : true;
  };

  return (
    <Field.Root invalid={hasFilenameError()}>
      <Field.Label>
        Filename
        <Text color="red">*</Text>
      </Field.Label>
      <InputGroup endAddon=".json">
        <Input
          value={filename}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            if (value.length > 0 && value.trim().length === 0) return;
            onChange({
              filename: value,
              valid:
                e.target.value.length > 0 &&
                validateFilename(e.target.value + ".json"),
            });
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onSubmit?.();
            }
          }}
          placeholder="e.g. my_device.json"
        />
      </InputGroup>
      {hasFilenameError() && (
        <Field.ErrorText color="red.600">{error}</Field.ErrorText>
      )}
    </Field.Root>
  );
};

export default FilenameInput;
