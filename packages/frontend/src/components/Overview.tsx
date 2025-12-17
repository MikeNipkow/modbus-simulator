import {
  Card,
  Heading,
  Text,
  VStack,
  HStack,
  Link,
  Button,
  Icon,
  Code,
  Separator,
  Clipboard,
} from "@chakra-ui/react";
import { FaGithub, FaCheckCircle } from "react-icons/fa";

const Overview = () => {
  const prompt = `
  You are mapping a Modbus(-TCP/RTU) device from a vendor manual to a JSON file that follows the attached sample JSON schema. Do all steps below exactly:

1) Scope & sources
- Parse only the vendor’s manual provided in this chat. Do not use outside sources.

2) Addressing normalization
- Normalize every register/bit address to decimal.
- If the manual shows hex addresses (e.g., 0x5000 or 5000h, or any address containes hexadecimal letters A-F), convert to decimal.
- If the manual uses Modbus “reference notation” (e.g., 40001, 30001), convert to zero-based register numbers if the sample schema expects register offsets — otherwise keep the manual’s base but be consistent across the JSON. State which convention you used in the report.
- If the manual shows bit fields inside a register, include one datapoint per bit only when the manual defines them as discrete items (coils/discrete inputs). Otherwise, keep it as a whole register.
- Some manual might already have a datapoint as the heading of the table. The first row might therefore be formatted differently. Do not skip those.

3) Datatype & size mapping
- Use only datatypes allowed by the sample schema (e.g., Bool, Byte, UInt16, Int16, UInt32, Int32, UInt64, Int64, Float32, Float64, ASCII).
- For multi-register values (Length=2 → 32-bit, Length=4 → 64-bit), map to the corresponding typed datapoint (e.g., FLOAT32 for 2-register float).
- For ASCII, set length = number of registers (2 bytes per register).
- Set endian at the device level to BigEndian/LittleEndian based on how the manual describes word ordering (e.g., “Float ABCD” → BigEndian). If unclear, default to BigEndian and say so.

4) Read/write rules
- Data points that are only available in the area "DiscreteInput" or "InputRegister" can must have accessMode "RO".
- Set the accessMode according to the manual (options: RO - read only, WO - write only, RW - read and write) for data points in the area "Coil" and "HoldingRegister"
- Only add "feedback" when the manual clearly defines a matching feedback datapoint and both have the same datatype. Use the id of the feedback data point for that.

5) Reserved ranges
If the manual lists reserved registers as a contiguous block, represent that entire block by multiple placeholder datapoints, one for each register address:
- Area: wherever the block lives (usually holdingRegisters).
- Name: "Reserved (block X–Y)".
- Type: UInt16
- Address: Reserved register address.
- accessMode: Read only

6) Household simulation options
- Try to figure out the default value of the datapoint and set it in the json file accordingly as defaultValue
- Make sure that the default value for ASCII datapoints does not exceed the datapoint length (1 register = 2 ASCII characters)
- You can the simulation property for a simulation object, containing wether it is enabled + reasonable minValue and maxValue for this data point.
- Use simulation with realistic minValue/maxValue for values that naturally fluctuate. For example in a single-family home:
  Voltages (e.g., 215–245 V line-neutral, 380–420 V line-line), Frequency (e.g., 49.9–50.1 Hz), Currents (0–40 A typical), Total active power (0–15 kW), PF (0–1), Reactive power (± reasonable).
- Only use simulation if the data point is not of type "ASCII"

Do not auto-change counters/energies by default.

7) Output
Produce two artifacts in this order:

A) The JSON file (output as a *.json file, not the raw data)
- Match the exact structure and keys of the sample JSON.
- Include every usable datapoint from the manual after applying the reserved-block rule above.
- The total amount of datapoints in the json file must equal the amount of datapoints in the manual + the reserved registers that were split into multiple datapoints.
- Ensure addresses are converted to decimal and unique inside each area.
- If the manual documents multiple unit IDs, split into multiple units entries; otherwise, use unitId: 1.

B) A verification report (human-readable; output as a *.pdf file, not the raw data)
Provide:
- Total datapoint count that you found in the original manual
- Total datapoint count that you actually wrote into the JSON (post-processing, after rolling up reserved blocks).
- A per-area breakdown (Coils, Discrete Inputs, Input Registers, Holding Registers).
- A per-range breakdown matching the manual’s tables (e.g., 4000–4033, 5000–5036, …) showing:
  “documented rows” (what the manual lists),
  “omitted reserved registers” (if you chose to omit) or “reserved rolled into N placeholder(s)”,
  “JSON datapoints written” (after roll-ups).
- A list of assumptions & ambiguities you resolved (endianness, addressing base, ASCII lengths, any inferred units).
- Validation checks you ran:
  No overlapping addresses in the same area.
  Datatype sizes match register length.
  Read/write flags follow the manual.
  writeFeedback pairs exist and match types.
  Decimal address conversion is consistent.

If anything in the manual is contradictory or missing, make the best conservative choice, explain it, and flag it in the report.
  `;

  return (
    <VStack paddingY={"12px"}>
      <Card.Root
        overflow={"hidden"}
        width="80%"
        borderRadius={"2xl"}
        boxShadow={"xl"}
      >
        <Card.Header
          padding={"36px"}
          bg={"bg.dark"}
          borderBottom={"1px solid"}
          borderColor={"gray.200"}
        >
          <Heading size={"2xl"}>Modbus Simulator</Heading>
        </Card.Header>

        <Card.Body padding={"28px 36px"}>
          <Text fontSize="md">
            A lightweight Modbus-TCP simulator for local development, testing
            and integration. Create and configure virtual Modbus devices,
            simulate registers and test client integrations without physical
            hardware.
          </Text>
          <Separator marginY={4} />
          <Heading size="lg" mb={2}>
            Key features
          </Heading>
          <VStack gap={2} align={"flex-start"}>
            <HStack>
              <Icon as={FaCheckCircle} color="green.400" />
              Communication logging
            </HStack>
            <HStack>
              <Icon as={FaCheckCircle} color="green.400" />
              Create and edit device templates
            </HStack>
            <HStack>
              <Icon as={FaCheckCircle} color="green.400" />
              Value simulation within a customizable range
            </HStack>
            <HStack>
              <Icon as={FaCheckCircle} color="green.400" />
              Run multiple virtual devices concurrently
            </HStack>
            <HStack>
              <Icon as={FaCheckCircle} color="green.400" />
              Multiple Modbus units per device
            </HStack>
            <HStack>
              <Icon as={FaCheckCircle} color="green.400" />
              Define feedback datapoints (change feedback value on write-request
              to another datapoint)
            </HStack>
            <HStack>
              <Icon as={FaCheckCircle} color="green.400" />
              Support multiple data types (Bool, Byte, Int16, Int32, Int64,
              UInt16, UInt32, UInt64, Float32, Float64, ASCII)
            </HStack>
          </VStack>
          <Separator marginY={4} />
          <Heading size={"lg"}>AI-generated templates</Heading>
          <Text>
            Use AI tools like ChatGPT to auto-generate device templates based on
            real-world Modbus devices.
          </Text>
          <Text>
            Simply provide the modbus datapoint table as pdf file, as well as
            the{" "}
            <>
              <Code>sample_device.json</Code>
            </>{" "}
            template included in this repository.
          </Text>
          <Text mt={4}>
            You can copy the following prompt to generate new device templates:
          </Text>
          <Clipboard.Root mt={2} value={prompt}>
            <Clipboard.Trigger asChild>
              <Button variant="surface" size="sm">
                <Clipboard.Indicator />
                <Clipboard.CopyText />
              </Button>
            </Clipboard.Trigger>
          </Clipboard.Root>
          <Separator marginY={4} />
          <Heading size={"lg"}>Repository</Heading>
          Check out the GitHub repository for source code, documentation and
          installation instructions.
          <HStack gap={4} alignItems="center">
            <Link mt={2} href="https://github.com/MikeNipkow/modbus-simulator">
              <Button variant="outline">
                <Icon as={FaGithub} />
                View on GitHub
              </Button>
            </Link>
          </HStack>
        </Card.Body>
      </Card.Root>
    </VStack>
  );
};

export default Overview;
