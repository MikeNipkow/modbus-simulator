/**
 * Log levels enumeration.
 */
export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

/**
 * Log message structure.
 */
export type LogMessage = {
  level: LogLevel;
  message: string;
  timestamp: Date;
};
