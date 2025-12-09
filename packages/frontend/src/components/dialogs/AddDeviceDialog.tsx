import {
  Dialog,
  Button,
  Input,
  VStack,
  HStack,
  Stack,
  Text,
  Select,
  createListCollection,
} from "@chakra-ui/react";
import DialogHeader from "./base/DialogHeader";
import { useState, useMemo } from "react";
import type { ModbusDevice } from "@/types/ModbusDevice";

interface Props {
  open: boolean;
  onClose: () => void;
  template: boolean;
  templates?: ModbusDevice[];
  onSubmit?: (filename: string, templateFilename?: string) => void;
}

const AddDeviceDialog = ({
  open,
  onClose,
  template,
  templates = [],
  onSubmit,
}: Props) => {
  const [filename, setFilename] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<string[]>([]);

  const templateCollection = useMemo(
    () =>
      createListCollection({
        items: [
          { label: "No template", value: "" },
          ...templates.map((t) => ({ label: t.filename, value: t.filename })),
        ],
      }),
    [templates],
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (filename.trim()) {
      onSubmit?.(filename, selectedTemplate[0] || undefined);
      setFilename("");
      setSelectedTemplate([]);
      onClose();
    }
  };

  const handleClose = () => {
    setFilename("");
    setSelectedTemplate([]);
    onClose();
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(e) => (e.open ? undefined : handleClose())}
      placement={"center"}
    >
      {/* Darken background */}
      <Dialog.Backdrop />

      {/* Required to position dialog in center */}
      <Dialog.Positioner>
        <Dialog.Content>
          {/* Header */}
          <DialogHeader
            title={"Add " + (template ? "Template" : "Device")}
            onClose={handleClose}
          />

          {/* Body */}
          <Dialog.Body>
            <form onSubmit={handleSubmit} id="add-device-form">
              <VStack gap={4} align="stretch">
                <Stack gap="1.5">
                  <Text fontSize="sm" fontWeight="medium">
                    Filename{" "}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Text>
                  <Input
                    placeholder="Enter filename"
                    value={filename}
                    onChange={(e) => setFilename(e.target.value)}
                    required
                    autoFocus
                  />
                </Stack>

                {!template && templates.length > 0 && (
                  <Stack gap="1.5">
                    <Text fontSize="sm" fontWeight="medium">
                      Template (optional)
                    </Text>
                    <Select.Root
                      collection={templateCollection}
                      value={selectedTemplate}
                      onValueChange={(e) => setSelectedTemplate(e.value)}
                    >
                      <Select.Trigger>
                        <Select.ValueText placeholder="No template" />
                      </Select.Trigger>
                      <Select.Content>
                        {templateCollection.items.map((item) => (
                          <Select.Item key={item.value} item={item}>
                            {item.label}
                          </Select.Item>
                        ))}
                      </Select.Content>
                    </Select.Root>
                  </Stack>
                )}
              </VStack>
            </form>
          </Dialog.Body>

          {/* Footer */}
          <Dialog.Footer
            background={"bg.medium"}
            padding={"16px 24px"}
            borderTop={"1px solid"}
            borderColor={"gray.300"}
          >
            <HStack gap={3} width="100%" justify="flex-end">
              <Button
                padding={"16px 24px"}
                size={"lg"}
                variant="outline"
                onClick={handleClose}
                _hover={{ bg: "blackAlpha.50" }}
              >
                Cancel
              </Button>
              <Button
                padding={"16px 24px"}
                size={"lg"}
                type="submit"
                form="add-device-form"
                background={"brand"}
                color={"white"}
                _hover={{ bg: "brandDark" }}
              >
                Add
              </Button>
            </HStack>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};

export default AddDeviceDialog;
