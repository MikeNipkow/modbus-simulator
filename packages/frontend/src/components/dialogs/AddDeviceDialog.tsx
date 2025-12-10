import { isValidFilename } from "@/util/fileUtils";
import BaseDialog from "./BaseDialog";
import {
  Field,
  Input,
  Text,
  NativeSelectRoot,
  NativeSelectField,
} from "@chakra-ui/react";
import { useState } from "react";
import { useCreateDevice } from "@/hooks/useCreateDevice";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { Endian } from "@/types/enums/Endian";

interface Props {
  template: boolean;
  open: boolean;
  onClose: (filename?: string) => void;
  templates?: ModbusDevice[];
}

const AddDeviceDialog = ({ template, open, onClose, templates }: Props) => {
  const [filename, setFilename] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<ModbusDevice | null>(
    null,
  );
  const [error, setError] = useState("");

  const { createDevice, isLoading, errors } = useCreateDevice();

  const hasFilenameError = (): boolean => error !== "";
  const hasApiError = (): boolean => errors !== undefined && errors.length > 0;

  /**
   * Validate filename and set error state
   * @param value Filename to validate
   * @return Boolean indicating if filename is valid
   */
  const validateFilename = (value: string): boolean => {
    let error = "";
    if (!isValidFilename(value)) error = "Invalid filename";
    else if (!value.endsWith(".json")) error = 'Filename must end with ".json"';

    setError(error);
    return error !== "" ? false : true;
  };

  const handleSubmit = async () => {
    if (!validateFilename(filename)) return;

    let device: ModbusDevice;
    if (selectedTemplate) device = { ...selectedTemplate, filename: filename };
    else
      device = {
        filename: filename,
        port: 502,
        enabled: false,
        running: false,
        endian: Endian.BigEndian,
        template: template,
      };

    device.filename = filename;

    const success = await createDevice(device, template);
    if (success) onClose(filename);
  };

  return (
    <BaseDialog
      title={"Add " + (template ? "Template" : "Device")}
      open={open}
      onClose={() => onClose()}
      onSubmit={handleSubmit}
      loading={isLoading}
      loadingText="Saving..."
    >
      {/* Filename input */}
      <Field.Root invalid={hasFilenameError()}>
        <Field.Label>
          Filename
          <Text color="red">*</Text>
        </Field.Label>
        <Input
          value={filename}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setFilename(e.target.value);
            if (e.target.value.length > 0) validateFilename(e.target.value);
            else setError("");
          }}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="e.g. my_device.json"
        />
        {hasFilenameError() && (
          <Field.ErrorText color="red.600">{error}</Field.ErrorText>
        )}
      </Field.Root>

      {/* Template selection (optional) */}
      {true && (
        <Field.Root>
          <Field.Label>Template (Optional)</Field.Label>
          <NativeSelectRoot>
            <NativeSelectField
              value={selectedTemplate?.filename || ""}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                const templateFilename = e.target.value;
                const template = templates?.find(
                  (t) => t.filename === templateFilename,
                );
                setSelectedTemplate(template || null);
              }}
            >
              <option value="">-- Select a template --</option>
              {templates?.map((template) => (
                <option key={template.filename} value={template.filename}>
                  {template.filename}
                </option>
              ))}
            </NativeSelectField>
          </NativeSelectRoot>
        </Field.Root>
      )}

      {hasApiError() && (
        <Text color="red.600" fontSize="sm" mt={2}>
          {errors.join(", ")}
        </Text>
      )}
    </BaseDialog>
  );
};

export default AddDeviceDialog;
