/**
 * Log levels enumeration.
 */
export enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

/**
 * Log message structure.
 */
export type LogMessage = {
  level: LogLevel;
  message: string;
  timestamp: Date;
};

/**
 * Logger class to log messages with different severity levels.
 */
export class Logger {
  // Store messages with different severity levels.
  private logs: LogMessage[] = [];
  private readonly size: number;

  /**
   * Push a new log message to the logs array. If the size exceeds the limit, remove the oldest message.
   * @param logMessage The log message to be added.
   */
  private pushLog(logMessage: LogMessage) {
    this.logs.push(logMessage);
    if (this.logs.length > this.size) this.logs.shift();
  }

  /**
   * Create a Logger instance with a specified size.
   * @param size The maximum number of log messages to store.
   */
  public constructor(size: number = 50) {
    this.size = size;
  }

  /**
   * Log a debug message.
   * @param message The debug message to log.
   */
  public debug(message: string) {
    this.pushLog({ level: LogLevel.DEBUG, message, timestamp: new Date() });
  }

  /**
   * Log an info message.
   * @param message The info message to log.
   */
  public info(message: string) {
    this.pushLog({ level: LogLevel.INFO, message, timestamp: new Date() });
  }

  /**
   * Log a warning message.
   * @param message The warning message to log.
   */
  public warn(message: string) {
    this.pushLog({ level: LogLevel.WARN, message, timestamp: new Date() });
  }

  /**
   * Log an error message.
   * @param message The error message to log.
   */
  public error(message: string) {
    this.pushLog({ level: LogLevel.ERROR, message, timestamp: new Date() });
  }

  /**
   * Get all log messages.
   * @returns An array of log messages.
   */
  public getLogs() {
    return this.logs;
  }
}
