import { Tooltip } from "@/components/ui/Tooltip";
import useLogs from "@/hooks/device/useLogs";
import { LogLevel } from "@/types/enums/LogLevel";
import type { ModbusDevice } from "@/types/ModbusDevice";
import {
  Card,
  Checkbox,
  For,
  HStack,
  IconButton,
  Table,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaRotate } from "react-icons/fa6";

interface Props {
  device: ModbusDevice;
  isActive?: boolean;
}

const DeviceLogTable = ({ device, isActive }: Props) => {
  const [allowPolling, setAllowPolling] = useState(true);
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel[]>([
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
  ]);
  const [refreshTrigger, setRefreshTrigger] = useState({});
  const { logs } = useLogs(device, [refreshTrigger]);

  // Set up interval to refresh logs when visible and polling is allowed.
  useEffect(() => {
    let id: number | undefined;
    if (allowPolling && isActive) {
      // Immediate refresh and start interval while visible and polling allowed
      setRefreshTrigger({});
      id = window.setInterval(() => setRefreshTrigger({}), 1000);
    }
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [allowPolling, isActive]);

  /**
   * Get color based on log level.
   * @param level Log level.
   * @returns Color string.
   */
  const getColorForLogLevel = (level: LogLevel) => {
    switch (level) {
      case LogLevel.WARN:
      case LogLevel.ERROR:
        return "red.500";
      default:
        return "gray.500";
    }
  };

  return (
    <Card.Root
      width="90%"
      borderRadius={"2xl"}
      boxShadow={"xl"}
      marginBottom={"12px"}
    >
      <Card.Header>
        <HStack justifyContent={"space-between"}>
          <HStack gap={4}>
            <For each={Object.values(LogLevel)}>
              {(level: LogLevel) => (
                <Checkbox.Root
                  checked={logLevelFilter.includes(level)}
                  onCheckedChange={(checked) =>
                    checked.checked
                      ? setLogLevelFilter([...logLevelFilter, level])
                      : setLogLevelFilter(
                          logLevelFilter.filter((l) => l !== level),
                        )
                  }
                  key={level}
                >
                  <Checkbox.HiddenInput />
                  <Checkbox.Control bg={"primary"} borderColor={"primary"} />
                  <Checkbox.Label>{level}</Checkbox.Label>
                </Checkbox.Root>
              )}
            </For>
          </HStack>
          <Tooltip
            content="Auto-Refresh values"
            contentProps={{ css: { "--tooltip-bg": "white" } }}
          >
            <IconButton
              as={FaRotate}
              variant={"subtle"}
              colorPalette={allowPolling ? "green" : "white"}
              padding={"10px"}
              onClick={() => setAllowPolling(!allowPolling)}
            />
          </Tooltip>
        </HStack>
      </Card.Header>
      <Card.Body>
        <Table.Root
          size="sm"
          striped
          variant="outline"
          borderRadius={"xl"}
          overflow={"hidden"}
        >
          <Table.Header background={"bg.darker"} height={"50px"}>
            {/* Row Headers */}
            <Table.Row>
              <Table.ColumnHeader fontWeight={"bold"} width="40px">
                ID
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight={"bold"} width="70px">
                Level
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight={"bold"} width="160px">
                Time
              </Table.ColumnHeader>
              <Table.ColumnHeader fontWeight={"bold"}>
                Message
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          {/* Map rows or show placeholder while content is prepared */}
          <Table.Body>
            {logs && (
              <For each={logs}>
                {(log, id) =>
                  logLevelFilter.includes(log.level) && (
                    <Table.Row color={getColorForLogLevel(log.level)} key={id}>
                      <Table.Cell width={"40px"}>{id + 1}</Table.Cell>
                      <Table.Cell width={"70px"}>{log.level}</Table.Cell>
                      <Table.Cell width={"160px"}>
                        {new Date(log.timestamp).toLocaleString(
                          navigator.language,
                        )}
                      </Table.Cell>
                      <Table.Cell style={{ wordBreak: "break-word" }}>
                        {log.message}
                      </Table.Cell>
                    </Table.Row>
                  )
                }
              </For>
            )}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
};

export default DeviceLogTable;
