import useLogs from "@/hooks/device/useLogs";
import { LogLevel, type LogMessage } from "@/types/enums/LogLevel";
import type { ModbusDevice } from "@/types/ModbusDevice";
import { Card, Checkbox, For, HStack, Table } from "@chakra-ui/react";
import { useEffect, useState, useRef } from "react";

interface Props {
  device: ModbusDevice;
}

const DeviceLogTable = ({ device }: Props) => {
  const [logLevelFilter, setLogLevelFilter] = useState<LogLevel[]>([
    LogLevel.INFO,
    LogLevel.WARN,
    LogLevel.ERROR,
  ]);
  const [refreshTrigger, setRefreshTrigger] = useState({});
  const { logs, errors, isLoading } = useLogs(device, [refreshTrigger]);

  // observe visibility of the table container and only poll when visible
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState<boolean>(false);

  // Set up IntersectionObserver to track visibility
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // If IntersectionObserver not available, assume visible
      setVisible(true);
      return;
    }

    // Create observer.
    const obs = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? false),
      { threshold: 0.1 },
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Set up interval to refresh logs when visible.
  useEffect(() => {
    let id: number | undefined;
    if (visible) {
      // Immediate refresh and start interval while visible
      setRefreshTrigger({});
      id = window.setInterval(() => setRefreshTrigger({}), 1000);
    }
    return () => {
      if (id) window.clearInterval(id);
    };
  }, [visible]);

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
      ref={containerRef}
      width="90%"
      borderRadius={"2xl"}
      boxShadow={"xl"}
    >
      <Card.Body>
        <HStack paddingBottom={"24px"} gap={4}>
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
                <Checkbox.Control />
                <Checkbox.Label>{level}</Checkbox.Label>
              </Checkbox.Root>
            )}
          </For>
        </HStack>
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
              <Table.ColumnHeader fontWeight={"bold"}>ID</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight={"bold"}>Level</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight={"bold"}>Time</Table.ColumnHeader>
              <Table.ColumnHeader fontWeight={"bold"}>
                Message
              </Table.ColumnHeader>
            </Table.Row>
          </Table.Header>

          {/* Map rows or show placeholder while content is prepared */}
          <Table.Body>
            {logs &&
              logs.map((log: LogMessage, id: number) => (
                <Table.Row
                  color={getColorForLogLevel(log.level)}
                  key={id}
                  hidden={!logLevelFilter.includes(log.level)}
                >
                  <Table.Cell width={"20px"}>{id + 1}</Table.Cell>
                  <Table.Cell width={"50px"}>{log.level}</Table.Cell>
                  <Table.Cell width={"200px"}>
                    {new Date(log.timestamp).toLocaleString(navigator.language)}
                  </Table.Cell>
                  <Table.Cell>{log.message}</Table.Cell>
                </Table.Row>
              ))}
          </Table.Body>
        </Table.Root>
      </Card.Body>
    </Card.Root>
  );
};

export default DeviceLogTable;
