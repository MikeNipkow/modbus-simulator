import path from "path";
import { ModbusDevice } from "./ModbusDevice.js";
import * as fs from "fs";
import {
  deviceToDeviceProps,
  deviceFromObject,
} from "../mapper/ModbusDeviceMapper.js";
import { ParseResult } from "../types/enums/ParseResult.js";

/**
 * Manages Modbus devices stored in a specified directory.
 */
export class DeviceManager {
  // Directory where the devices are stored.
  private readonly deviceDir: string;

  // Loaded devices.
  private devices: Map<string, ModbusDevice> = new Map(); // <File name, ModbusDevice>

  /**
   * Creates an instance of DeviceManager.
   * @param deviceDir Directory where the devices are stored.
   * @throws Error if the specified directory does not exist.
   */
  constructor(deviceDir: string) {
    // Ensure directory exist.
    if (!fs.existsSync(deviceDir))
      throw new Error(`Device directory "${deviceDir}" does not exist`);

    this.deviceDir = deviceDir;
  }

  // ~~~~~ Device Management ~~~~~

  /**
   * Checks if a device with the given filename exists.
   * @param filename Filename of the device.
   * @returns True if the device exists, false otherwise.
   */
  public hasDevice(filename: string): boolean {
    return this.devices.has(filename);
  }

  /**
   * Retrieves a device by its filename.
   * @param filename Filename of the device.
   * @returns The ModbusDevice instance if found, undefined otherwise.
   */
  public getDevice(filename: string): ModbusDevice | undefined {
    return this.devices.get(filename);
  }

  /**
   * Adds a new device.
   * @param filename Filename of the device.
   * @param device The ModbusDevice instance to add.
   * @param startServer Whether to start the Modbus server for the device after adding. Default is false.
   * @returns True if the device was added successfully, false if a device with the same filename already exists.
   */
  public addDevice(
    filename: string,
    device: ModbusDevice,
    startServer?: boolean,
  ): boolean {
    // Check if device with the same filename already exists.
    if (this.hasDevice(filename)) return false;

    // Add device to map.
    this.devices.set(filename, device);

    // Enable simulation if configured.
    if (startServer && device.isEnabled()) device.startAllEnabledSimulations();

    // Start the Modbus server if requested.
    if (startServer && device.isEnabled()) device.startServer();

    return true;
  }

  /**
   * Deletes a device by its filename.
   * @param filename Filename of the device.
   * @returns True if the device was deleted successfully, false if the device does not exist.
   */
  public deleteDevice(filename: string): boolean {
    // Check if device exists.
    const device = this.getDevice(filename);
    if (!device) return false;

    // Stop server if running.
    if (device.isRunning()) device.stopServer();

    // Remove device from map and delete file.
    this.devices.delete(filename);
    fs.rmSync(path.join(this.deviceDir, filename));

    return true;
  }

  /**
   * Saves a device to its corresponding file.
   * @param filename Filename of the device.
   * @returns True if the device was saved successfully, false if the device does not exist.
   */
  public saveDevice(filename: string): boolean {
    const device = this.getDevice(filename);
    if (!device) return false;

    // Serialize device to JSON.
    const props = deviceToDeviceProps(device) as any;

    // Remove filename.
    delete props.filename;

    // Write JSON to file.
    const filePath = path.join(this.deviceDir, filename);
    fs.writeFileSync(filePath, JSON.stringify(props, null, 2), {
      encoding: "utf-8",
      flag: "w",
    });

    return true;
  }

  /**
   * Loads devices from the device directory.
   * @param startServer Whether to start the Modbus server for each device after loading. Default is false.
   * @returns An array of messages indicating the result of the loading process.
   */
  public async loadDevices(startServer: boolean = false): Promise<string[]> {
    // Array to hold any errors and messages encountered during loading.
    const messages: string[] = [];

    // Check if directory exists.
    if (!fs.existsSync(this.deviceDir)) {
      messages.push(
        `Failed to load devices: Directory "${this.deviceDir}" does not exist`,
      );
      return messages;
    }

    // Clear existing devices.
    if (this.devices.size > 0) {
      await this.stopAllServers();
      this.devices.clear();
    }

    // Read all files in the directory.
    const files = fs.readdirSync(this.deviceDir);

    // Process each file.
    for (const file of files) {
      // Get full file path.
      const filePath = path.join(this.deviceDir, file);

      // Check if it's a file and has a .json extension.
      if (
        fs.statSync(filePath).isFile() &&
        path.extname(file).toLowerCase() === ".json"
      ) {
        messages.push(
          "----------------------------------------------------------------",
        );
        messages.push(`Loading file: ${file}`);
        messages.push("");

        // Read file content.
        const data = fs.readFileSync(filePath, "utf8");

        // Try to parse file content as JSON object.
        let json;
        try {
          json = JSON.parse(data);
        } catch (error) {
          messages.push(`Failed to parse JSON file: ${filePath}`);
          continue;
        }

        // Deserialize JSON object into ModbusDevice instance.
        const result: ParseResult<ModbusDevice> = deviceFromObject(json, file);

        // Check for deserialization errors.
        if (!result.success) {
          messages.push(`Errors occurred while parsing ${file}:`);
          result.errors.forEach((err) => messages.push(` - ${err}`));
          continue;
        }

        // Add device to the appropriate map.
        const device = result.value;
        this.devices.set(file, device);

        const datapointCount = device
          .getAllUnits()
          .reduce((sum, unit) => sum + unit.getAllDataPoints().length, 0);

        messages.push(`Successfully loaded device from file: ${file}`);
        messages.push(" - Device Name: " + device.getName());
        messages.push(" - Units: " + device.getAllUnits().length);
        messages.push(" - Data Points: " + datapointCount);
        messages.push("");

        // Enable simulation if configured.
        if (startServer) device.startAllEnabledSimulations();

        // Start the Modbus server if requested.
        if (startServer && device.isEnabled()) {
          const { success, message } = await device.startServer();
          messages.push(message);
        }
        messages.push(
          "----------------------------------------------------------------",
        );
      }
    }

    // Ensure messages are always returned, even if no files are processed
    return messages;
  }

  /**
   * Retrieves the full file path of a device by its filename.
   * @param filename Filename of the device.
   * @returns The full file path if the device exists, null otherwise.
   */
  public getDeviceFile(filename: string): string | null {
    // Check if device exists.
    if (!this.hasDevice(filename)) return null;

    // Return full file path.
    return path.join(this.deviceDir, filename);
  }

  // ~~~~~ Modbus Server Management ~~~~~

  /**
   * Stops all running Modbus servers.
   */
  public stopAllServers() {
    // Iterate through all devices and stop their servers if running.
    for (const device of this.devices.values()) {
      // Stop simulations and server if running.
      if (device.isRunning()) {
        device.stopAllSimulations();
        device.stopServer();
      }
    }
  }

  // ~~~~~ Getter & Setter ~~~~~

  /**
   * Retrieves all loaded devices.
   * @returns An array of all ModbusDevice instances.
   */
  getDevices(): ModbusDevice[] {
    return Array.from(this.devices.values());
  }
}
