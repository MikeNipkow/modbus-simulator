import type { ModbusDevice } from "@/types/ModbusDevice";
import { useState, useEffect } from "react";
import {
  VStack,
  HStack,
  Button,
  Field,
  Input,
  Textarea,
  NativeSelectRoot,
  NativeSelectField,
  Heading,
  Spacer,
  Checkbox,
  Grid,
  GridItem,
  Box,
  Card,
  Separator,
  Icon,
  Badge,
  Table,
  Collapsible,
  Text,
} from "@chakra-ui/react";
import {
  FaTrash,
  FaDownload,
  FaSave,
  FaServer,
  FaInfoCircle,
  FaChevronDown,
  FaChevronRight,
  FaPlus,
} from "react-icons/fa";
import { Endian } from "@/types/enums/Endian";
import type { ModbusUnit } from "@/types/ModbusUnit";
import { AccessMode } from "@/types/enums/AccessMode";

interface Props {
  device: ModbusDevice;
  onDelete?: (device: ModbusDevice) => void;
  onSaveAsTemplate?: (device: ModbusDevice) => void;
}

const DeviceEditorOld = ({ device, onDelete, onSaveAsTemplate }: Props) => {
  // Working copy of the device
  const [editedDevice, setEditedDevice] = useState<ModbusDevice>({ ...device });

  // Reset edited device when device prop changes
  useEffect(() => {
    setEditedDevice({ ...device });
  }, [device]);

  const handleDownload = () => {
    const json = JSON.stringify(editedDevice, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = editedDevice.filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Box h="100%" overflowY="auto" bg="bg.subtle">
      <VStack align="stretch" gap={6} maxW="1400px" mx="auto" p={8}>
        {/* Header with Actions */}
        <Card.Root
          shadow="xl"
          borderRadius="2xl"
          bg="gradient-to-br"
          gradientFrom="bg"
          gradientTo="bg.muted"
        >
          <Card.Body p={6}>
            <HStack>
              <HStack gap={3} flex={1}>
                <Box p={3} borderRadius="xl" bg="primary" color="white">
                  <Icon fontSize="3xl">
                    <FaServer />
                  </Icon>
                </Box>
                <VStack align="start" gap={0}>
                  <HStack gap={2}>
                    <Heading size="2xl">{device.filename}</Heading>
                    {device.template && (
                      <Badge colorPalette="purple" size="md" variant="solid">
                        Template
                      </Badge>
                    )}
                    {editedDevice.running && (
                      <Badge colorPalette="green" size="md" variant="solid">
                        ● Running
                      </Badge>
                    )}
                  </HStack>
                  {editedDevice.name && (
                    <Box color="fg.muted" fontSize="lg" mt={1}>
                      {editedDevice.name}
                    </Box>
                  )}
                </VStack>
              </HStack>
              <HStack gap={3}>
                <Button
                  colorPalette="red"
                  onClick={() => onDelete?.(device)}
                  size="lg"
                  variant="outline"
                >
                  <FaTrash />
                  Delete
                </Button>
                <Button onClick={handleDownload} size="lg" variant="outline">
                  <FaDownload />
                  Download
                </Button>
                <Button
                  colorPalette="blue"
                  onClick={() => onSaveAsTemplate?.(editedDevice)}
                  size="lg"
                  variant="solid"
                >
                  <FaSave />
                  Save as Template
                </Button>
              </HStack>
            </HStack>
          </Card.Body>
        </Card.Root>

        {/* Device Properties */}
        <Card.Root shadow="xl" borderRadius="2xl">
          <Card.Header p={6} pb={4}>
            <HStack gap={3}>
              <Box
                p={2}
                borderRadius="lg"
                bg="blue.50"
                _dark={{ bg: "blue.900" }}
              >
                <Icon
                  fontSize="xl"
                  color="blue.600"
                  _dark={{ color: "blue.300" }}
                >
                  <FaInfoCircle />
                </Icon>
              </Box>
              <Heading size="xl">Device Configuration</Heading>
            </HStack>
          </Card.Header>
          <Separator />
          <Card.Body p={8}>
            <Grid templateColumns="repeat(2, 1fr)" gap={8}>
              {/* Left Column */}
              <GridItem>
                <VStack align="stretch" gap={5}>
                  <Field.Root>
                    <Field.Label fontWeight="semibold">Filename</Field.Label>
                    <Input
                      value={editedDevice.filename}
                      onChange={(e) =>
                        setEditedDevice({
                          ...editedDevice,
                          filename: e.target.value,
                        })
                      }
                      size="lg"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontWeight="semibold">
                      Display Name
                    </Field.Label>
                    <Input
                      value={editedDevice.name || ""}
                      onChange={(e) =>
                        setEditedDevice({
                          ...editedDevice,
                          name: e.target.value,
                        })
                      }
                      placeholder="Enter a friendly name"
                      size="lg"
                    />
                  </Field.Root>

                  <Field.Root>
                    <Field.Label fontWeight="semibold">Vendor</Field.Label>
                    <Input
                      value={editedDevice.vendor || ""}
                      onChange={(e) =>
                        setEditedDevice({
                          ...editedDevice,
                          vendor: e.target.value,
                        })
                      }
                      placeholder="Manufacturer name"
                      size="lg"
                    />
                  </Field.Root>

                  <HStack gap={5}>
                    <Field.Root flex={1}>
                      <Field.Label fontWeight="semibold">Port</Field.Label>
                      <Input
                        type="number"
                        value={editedDevice.port}
                        onChange={(e) =>
                          setEditedDevice({
                            ...editedDevice,
                            port: parseInt(e.target.value) || 502,
                          })
                        }
                        size="lg"
                      />
                    </Field.Root>

                    <Field.Root flex={1}>
                      <Field.Label fontWeight="semibold">
                        Endianness
                      </Field.Label>
                      <NativeSelectRoot size="lg">
                        <NativeSelectField
                          value={editedDevice.endian}
                          onChange={(e) =>
                            setEditedDevice({
                              ...editedDevice,
                              endian: e.target.value as Endian,
                            })
                          }
                        >
                          <option value={Endian.BigEndian}>Big Endian</option>
                          <option value={Endian.LittleEndian}>
                            Little Endian
                          </option>
                        </NativeSelectField>
                      </NativeSelectRoot>
                    </Field.Root>
                  </HStack>

                  <Box pt={2}>
                    <Checkbox.Root
                      checked={editedDevice.enabled}
                      onCheckedChange={(details: any) =>
                        setEditedDevice({
                          ...editedDevice,
                          enabled: details.checked,
                        })
                      }
                      size="lg"
                    >
                      <Checkbox.Label fontWeight="semibold">
                        Enable Device
                      </Checkbox.Label>
                      <Checkbox.Control />
                    </Checkbox.Root>
                  </Box>
                </VStack>
              </GridItem>

              {/* Right Column */}
              <GridItem>
                <VStack align="stretch" gap={5}>
                  <Field.Root h="100%">
                    <Field.Label fontWeight="semibold">Description</Field.Label>
                    <Textarea
                      value={editedDevice.description || ""}
                      onChange={(e) =>
                        setEditedDevice({
                          ...editedDevice,
                          description: e.target.value,
                        })
                      }
                      placeholder="Add device description, notes, or documentation..."
                      size="lg"
                      h="100%"
                      minH="300px"
                    />
                  </Field.Root>
                </VStack>
              </GridItem>
            </Grid>
          </Card.Body>
        </Card.Root>

        {/* Modbus Units */}
        <Card.Root shadow="xl" borderRadius="2xl">
          <Card.Header p={6} pb={4}>
            <HStack>
              <HStack gap={3}>
                <Box
                  p={2}
                  borderRadius="lg"
                  bg="purple.50"
                  _dark={{ bg: "purple.900" }}
                >
                  <Icon
                    fontSize="xl"
                    color="purple.600"
                    _dark={{ color: "purple.300" }}
                  >
                    <FaServer />
                  </Icon>
                </Box>
                <Heading size="xl">Modbus Units</Heading>
                {editedDevice.modbusUnits &&
                  editedDevice.modbusUnits.length > 0 && (
                    <Badge colorPalette="purple" size="lg" variant="solid">
                      {editedDevice.modbusUnits.length}
                    </Badge>
                  )}
              </HStack>
              <Spacer />
              <Button colorPalette="blue" size="lg" variant="solid">
                <FaPlus />
                Add Unit
              </Button>
            </HStack>
          </Card.Header>
          <Separator />
          <Card.Body p={8}>
            {!editedDevice.modbusUnits ||
            editedDevice.modbusUnits.length === 0 ? (
              <Box
                textAlign="center"
                py={16}
                borderRadius="xl"
                bg="bg.muted"
                borderWidth="2px"
                borderStyle="dashed"
                borderColor="border.subtle"
              >
                <Icon fontSize="5xl" mb={4} color="fg.subtle">
                  <FaServer />
                </Icon>
                <Text fontSize="xl" fontWeight="semibold" color="fg.default">
                  No units configured
                </Text>
                <Text fontSize="md" mt={2} color="fg.muted">
                  Add a Modbus Unit to get started
                </Text>
              </Box>
            ) : (
              <VStack align="stretch" gap={4}>
                {editedDevice.modbusUnits.map((unit) => (
                  <UnitCard key={unit.unitId} unit={unit} />
                ))}
              </VStack>
            )}
          </Card.Body>
        </Card.Root>
      </VStack>
    </Box>
  );
};

interface UnitCardProps {
  unit: ModbusUnit;
}

const UnitCard = ({ unit }: UnitCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card.Root
      variant="elevated"
      borderWidth="1px"
      borderRadius="xl"
      transition="all 0.2s"
      _hover={{ shadow: "lg", transform: "translateY(-2px)" }}
    >
      <Card.Body p={6}>
        <VStack align="stretch" gap={4}>
          {/* Unit Header */}
          <HStack>
            <Button
              variant="ghost"
              size="md"
              onClick={() => setIsOpen(!isOpen)}
              p={2}
              minW="auto"
              borderRadius="lg"
              _hover={{ bg: "bg.muted" }}
            >
              <Icon
                fontSize="2xl"
                color={isOpen ? "primary" : "fg.muted"}
                transition="all 0.2s"
              >
                {isOpen ? <FaChevronDown /> : <FaChevronRight />}
              </Icon>
            </Button>
            <VStack align="start" gap={0} flex={1}>
              <HStack gap={3}>
                <Heading size="lg">Unit {unit.unitId}</Heading>
                <Badge colorPalette="blue" size="md" variant="solid">
                  {unit.dataPoints?.length || 0} DataPoint
                  {unit.dataPoints?.length !== 1 ? "s" : ""}
                </Badge>
              </HStack>
            </VStack>
            <HStack gap={3}>
              <Button size="md" variant="outline" colorPalette="blue">
                <FaPlus />
                Add DataPoint
              </Button>
              <Button colorPalette="red" size="md" variant="ghost">
                <FaTrash />
              </Button>
            </HStack>
          </HStack>

          {/* DataPoints Table */}
          <Collapsible.Root open={isOpen}>
            <Collapsible.Content>
              {!unit.dataPoints || unit.dataPoints.length === 0 ? (
                <Box
                  textAlign="center"
                  py={12}
                  color="fg.muted"
                  bg="bg.muted"
                  borderRadius="xl"
                  borderWidth="2px"
                  borderStyle="dashed"
                  borderColor="border.subtle"
                >
                  <Text fontWeight="semibold" fontSize="lg">
                    No DataPoints configured
                  </Text>
                  <Text fontSize="md" mt={1}>
                    Click "Add DataPoint" to create one
                  </Text>
                </Box>
              ) : (
                <Box
                  borderRadius="xl"
                  overflow="hidden"
                  borderWidth="1px"
                  shadow="sm"
                >
                  <Table.Root size="md" variant="outline">
                    <Table.Header bg="bg.emphasized">
                      <Table.Row>
                        <Table.ColumnHeader fontWeight="bold" fontSize="sm">
                          ID
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold" fontSize="sm">
                          Name
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold" fontSize="sm">
                          Type
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold" fontSize="sm">
                          Address
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold" fontSize="sm">
                          Area
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold" fontSize="sm">
                          Access
                        </Table.ColumnHeader>
                        <Table.ColumnHeader fontWeight="bold" fontSize="sm">
                          Value
                        </Table.ColumnHeader>
                        <Table.ColumnHeader
                          fontWeight="bold"
                          fontSize="sm"
                          textAlign="right"
                        >
                          Actions
                        </Table.ColumnHeader>
                      </Table.Row>
                    </Table.Header>
                    <Table.Body>
                      {unit.dataPoints.map((dp, index) => (
                        <Table.Row
                          key={dp.id}
                          bg={index % 2 === 0 ? "bg.subtle" : "bg"}
                          _hover={{ bg: "bg.muted", transition: "all 0.2s" }}
                        >
                          <Table.Cell
                            fontFamily="mono"
                            fontWeight="semibold"
                            fontSize="sm"
                          >
                            {dp.id}
                          </Table.Cell>
                          <Table.Cell fontWeight="medium">
                            {dp.name || <Text color="fg.muted">-</Text>}
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="sm"
                              colorPalette="purple"
                              variant="solid"
                            >
                              {dp.type}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell fontFamily="mono" fontSize="sm">
                            {dp.address}
                          </Table.Cell>
                          <Table.Cell>
                            <HStack gap={1} flexWrap="wrap">
                              {dp.areas.map((area) => (
                                <Badge
                                  key={area}
                                  size="sm"
                                  variant="subtle"
                                  colorPalette="gray"
                                >
                                  {area}
                                </Badge>
                              ))}
                            </HStack>
                          </Table.Cell>
                          <Table.Cell>
                            <Badge
                              size="sm"
                              variant="solid"
                              colorPalette={
                                dp.accessMode === AccessMode.ReadWrite
                                  ? "green"
                                  : dp.accessMode === AccessMode.ReadOnly
                                    ? "blue"
                                    : "orange"
                              }
                            >
                              {dp.accessMode}
                            </Badge>
                          </Table.Cell>
                          <Table.Cell fontFamily="mono" fontSize="sm">
                            {dp.value !== undefined && dp.value !== null ? (
                              <Text fontWeight="semibold">
                                {String(dp.value)}
                              </Text>
                            ) : (
                              <Text color="fg.muted">-</Text>
                            )}
                          </Table.Cell>
                          <Table.Cell textAlign="right">
                            <HStack gap={2} justifyContent="flex-end">
                              <Button size="sm" variant="outline">
                                Edit
                              </Button>
                              <Button
                                colorPalette="red"
                                size="sm"
                                variant="ghost"
                              >
                                <FaTrash />
                              </Button>
                            </HStack>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table.Root>
                </Box>
              )}
            </Collapsible.Content>
          </Collapsible.Root>
        </VStack>
      </Card.Body>
    </Card.Root>
  );
};

export default DeviceEditorOld;
