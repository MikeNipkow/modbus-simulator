import { ModbusUnit } from "./ModbusUnit.js";
import { DataArea } from "./types/enums/DataArea.js";
import { Endian } from "./types/enums/Endian.js";
import Modbus, { FCallbackVal } from "modbus-serial";
import { ModbusError } from "./types/enums/ModbusError.js";
import { ModbusDeviceProps } from "./types/ModbusDeviceProps.js";
import { isValidFilename } from "./util/fileUtils.js";

/**
 * Class representing a Modbus device with multiple units and data points.
 */
export class ModbusDevice implements Modbus.IServiceVector {
  // Device info.
  private readonly filename: string;
  private enabled: boolean;
  private port: number;
  private endian: Endian = Endian.BigEndian;
  private name: string;
  private vendor: string;
  private description: string;

  // Different modbus units (Unit-ID 1-254) with different data points.
  private units: Map<number, ModbusUnit> = new Map(); // <Unit-ID>, ModbusUnit>

  // Modbus server instance.
  private server: Modbus.ServerTCP | undefined;
  private running: boolean = false;

  /**
   * Creates a new ModbusDevice instance.
   * @param props The properties of the Modbus device.
   */
  constructor(props: ModbusDeviceProps) {
    // Validate filename.
    if (!isValidFilename(props.filename))
      throw new Error("ModbusDevice must have a valid non-empty filename");

    // Check if filename ends with .json.
    if (!props.filename.endsWith(".json"))
      throw new Error("ModbusDevice filename must end with .json");

    // Check if port is valid.
    if (props.port < 1 || props.port > 65535)
      throw new Error("ModbusDevice port must be between 1 and 65535");

    this.filename = props.filename;
    this.enabled = props.enabled;
    this.port = props.port;
    this.endian = props.endian ?? Endian.BigEndian;
    this.name = props.name ?? this.filename.replace(".json", "");
    this.vendor = props.vendor ?? "";
    this.description = props.description ?? "";

    // Add units.
    if (props.modbusUnits && props.modbusUnits.length > 0) {
      for (const unitProps of props.modbusUnits) {
        const unit = new ModbusUnit(unitProps);
        const result = this.addUnit(unit);

        // Check for errors.
        if (!result)
          throw new Error(
            `Failed to add ModbusUnit with id '${unit.getId()}' to ModbusDevice '${this.filename}': Unit already exists`,
          );
      }
    }
  }

  // ~~~~~ Unit Management ~~~~~

  /**
   * Checks if a unit with the given ID exists.
   * @param id The ID of the unit.
   * @returns True if the unit exists, false otherwise.
   */
  public hasUnit(id: number): boolean {
    return this.units.has(id);
  }

  /**
   * Retrieves the unit with the given ID.
   * @param id The ID of the unit.
   * @returns The ModbusUnit with the given ID, or undefined if not found.
   */
  public getUnit(id: number): ModbusUnit | undefined {
    return this.units.get(id);
  }

  /**
   * Adds a new unit to the device.
   * @param unit The ModbusUnit to add.
   * @returns True if the unit was added successfully, false if the unit is undefined or already exists.
   */
  public addUnit(unit: ModbusUnit): boolean {
    // Validate unit.
    if (unit === undefined || this.hasUnit(unit.getId())) return false;

    this.units.set(unit.getId(), unit);
    return true;
  }

  /**
   * Deletes the unit with the given ID.
   * @param id The ID of the unit to delete.
   * @returns True if the unit was deleted successfully, false otherwise.
   */
  public deleteUnit(id: number): boolean {
    return this.units.delete(id);
  }

  /**
   * Starts simulations for all data points that have simulation enabled.
   */
  public startAllEnabledSimulations(): void {
    for (const unit of this.units.values())
      for (const dp of unit.getAllDataPoints())
        if (dp.isSimulationEnabled()) dp.startSimulation();
  }

  /**
   * Stops all running simulations for all data points.
   */
  public stopAllSimulations(): void {
    for (const unit of this.units.values())
      for (const dp of unit.getAllDataPoints()) dp.stopSimulation();
  }

  // ~~~~~ Modbus Server ~~~~~

  /**
   * Enables the Modbus server.
   * @returns A promise that resolves with the result of the enable attempt and a message.
   */
  public enableServer(): Promise<{ success: boolean; message: string }> {
    // Check if server is already enabled.
    if (this.enabled)
      return Promise.resolve({
        success: false,
        message: `Modbus server on device '${this.name}' is already enabled`,
      });

    this.enabled = true;

    // Start server.
    return this.startServer();
  }

  /**
   * Disables the Modbus server.
   * @returns A promise that resolves with the result of the disable attempt and a message.
   */
  public disableServer(): Promise<{ success: boolean; message: string }> {
    // Check if server is already disabled.
    if (!this.enabled)
      return Promise.resolve({
        success: false,
        message: `Modbus server on device '${this.name}' is already disabled`,
      });

    this.enabled = false;

    // Stop server.
    return this.stopServer();
  }

  /**
   * Checks if the Modbus server is running.
   * @returns True if the Modbus server is running, false otherwise.
   */
  public isRunning(): boolean {
    return this.running && this.server !== undefined;
  }

  /**
   * Starts the Modbus server.
   * @param timeoutMs Optional timeout in milliseconds to wait for server start (default: 3000ms).
   * @returns A promise that resolves with the result of the server start attempt and a message.
   */
  public startServer(
    timeoutMs: number = 3000,
  ): Promise<{ success: boolean; message: string }> {
    // Check if server is already running.
    if (this.isRunning())
      return Promise.resolve({
        success: false,
        message: `Modbus server on device '${this.name}' is already running`,
      });

    return new Promise((resolve) => {
      // Try to open the Modbus server socket.
      this.server = new Modbus.ServerTCP(this, {
        host: "0.0.0.0",
        port: this.port,
      });

      // Check if server was started successfully.
      this.server.on("initialized", () => {
        // Stop the timeout timer.
        clearTimeout(timeout);

        this.running = true;
        return resolve({
          success: true,
          message: `Modbus server started on device '${this.name}' using port ${this.port}`,
        });
      });

      // Handle server errors.
      this.server.on("serverError", (err: any) => {
        // Stop the timeout timer.
        clearTimeout(timeout);

        this.running = false;

        if (err?.message?.match(/EADDRINUSE/))
          return resolve({
            success: false,
            message: `Failed to start Modbus server on device '${this.name}': Port ${this.port} is already in use`,
          });
        else
          return resolve({
            success: false,
            message: `Modbus server error on device '${this.name}': ${err.message}`,
          });
      });

      // Timeout if no response within the specified timeoutMs.
      const timeout = setTimeout(() => {
        this.running = false;
        return resolve({
          success: false,
          message: `Failed to start Modbus server on device '${this.name}': Timeout`,
        });
      }, timeoutMs);
    });
  }

  /**
   * Stops the Modbus server.
   * @returns A promise that resolves with the result of the server stop attempt and a message.
   */
  public stopServer(
    saveState: boolean = true,
  ): Promise<{ success: boolean; message: string }> {
    // Check if server is already stopped.
    if (!this.isRunning())
      return Promise.resolve({
        success: false,
        message: `Modbus server on device '${this.name}' is already stopped`,
      });

    return new Promise<{ success: boolean; message: string }>((resolve) => {
      // Check if server is running.
      if (!this.isRunning())
        return resolve({
          success: false,
          message: `Modbus server on device '${this.name}' is not running`,
        });

      // Close server.
      this.server?.close((err: any) => {
        // Check for errors.
        if (err)
          return resolve({
            success: false,
            message: `Failed to stopped Modbus server on device '${this.name}': ${err}`,
          });

        this.running = false;
        return resolve({
          success: true,
          message: `Modbus server on device '${this.name}' stopped successfully`,
        });
      });
    });
  }

  // ~~~~~ Modbus communication ~~~~~

  /**
   * Modbus request handler for discrete inputs.
   * @param addr The address of the data point.
   * @param unitID The ID of the unit to read from.
   * @param cb The callback function to call with the result.
   */
  public getDiscreteInput(
    addr: number,
    unitID: number,
    cb: FCallbackVal<boolean>,
  ): void {
    this.handleReadRequest(DataArea.DiscreteInput, addr, unitID, cb);
  }

  /**
   * Modbus request handler for coils.
   * @param addr The address of the data point.
   * @param unitID The ID of the unit to read from.
   * @param cb The callback function to call with the result.
   */
  public getCoil(
    addr: number,
    unitID: number,
    cb: FCallbackVal<boolean>,
  ): void {
    this.handleReadRequest(DataArea.Coil, addr, unitID, cb);
  }

  /**
   * Modbus request handler for reading holding registers.
   * @param addr The address of the data point.
   * @param unitID The ID of the unit to read from.
   * @param cb The callback function to call with the result.
   */
  public getHoldingRegister(
    addr: number,
    unitID: number,
    cb: FCallbackVal<number>,
  ): void {
    this.handleReadRequest(DataArea.HoldingRegister, addr, unitID, cb);
  }

  /**
   * Modbus request handler for reading input registers.
   * @param addr The address of the data point.
   * @param unitID The ID of the unit to read from.
   * @param cb The callback function to call with the result.
   */
  public getInputRegister(
    addr: number,
    unitID: number,
    cb: FCallbackVal<number>,
  ): void {
    this.handleReadRequest(DataArea.InputRegister, addr, unitID, cb);
  }

  /**
   * Modbus request handler for setting coils.
   * @param addr The address of the data point.
   * @param value The value to set.
   * @param unitID The ID of the unit to write to.
   * @param cb The callback function to call with the result.
   */
  public setCoil(
    addr: number,
    value: boolean,
    unitID: number,
    cb: FCallbackVal<any>,
  ): void {
    this.handleWriteRequest(DataArea.Coil, addr, unitID, value, cb);
  }

  /**
   * Modbus request handler for setting holding registers.
   * @param addr The address of the data point.
   * @param value The value to set.
   * @param unitID The ID of the unit to write to.
   * @param cb The callback function to call with the result.
   */
  public setRegister(
    addr: number,
    value: number,
    unitID: number,
    cb: FCallbackVal<any>,
  ): void {
    this.handleWriteRequest(DataArea.HoldingRegister, addr, unitID, value, cb);
  }

  /**
   * Handles a read request for a specific data point.
   * @param area The data area to read from.
   * @param addr The address of the data point.
   * @param unitID The ID of the unit to read from.
   * @param cb The callback function to call with the result.
   */
  private handleReadRequest(
    area: DataArea,
    addr: number,
    unitID: number,
    cb: FCallbackVal<any>,
  ): void {
    // Check if unit exists.
    const unit = this.getUnit(unitID);
    if (unit === undefined) {
      cb(
        {
          modbusErrorCode: ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND,
        } as any,
        null,
      );
      return;
    }

    // Check if data point exists at the given address.
    let dp = unit.getDataPointAt(area, addr);
    if (dp === undefined) {
      cb({ modbusErrorCode: ModbusError.ILLEGAL_DATA_ADDRESS } as any, null);
      return;
    }

    // Check if datapoint is write-only.
    if (!dp.hasReadAccess()) {
      cb({ modbusErrorCode: ModbusError.ILLEGAL_DATA_ADDRESS } as any, null);
      return;
    }

    // Calculate offset to base address for multi-register data points.
    const offset = addr - dp.getAddress();

    const val = dp.getRegisterValue(offset, this.endian);
    // Return the value.
    cb(null, dp.getRegisterValue(offset, this.endian));
  }

  /**
   * Modbus request handler for setting holding registers.
   * @param area The data area to write to.
   * @param addr The address of the data point.
   * @param unitID The ID of the unit to write to.
   * @param value The value to set.
   * @param cb The callback function to call with the result.
   */
  private handleWriteRequest(
    area: DataArea,
    addr: number,
    unitID: number,
    value: any,
    cb: FCallbackVal<any>,
  ): void {
    // Check if unit exists.
    const unit = this.getUnit(unitID);
    if (unit === undefined) {
      cb(
        {
          modbusErrorCode: ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND,
        } as any,
        null,
      );
      return;
    }

    // Check if data point exists at the given address.
    const dp = unit.getDataPointAt(area, addr);
    if (dp === undefined) {
      cb({ modbusErrorCode: ModbusError.ILLEGAL_DATA_ADDRESS } as any, null);
      return;
    }

    // Check if datapoint is read-only.
    if (!dp.hasWriteAccess()) {
      cb({ modbusErrorCode: ModbusError.ILLEGAL_DATA_VALUE } as any, null);
      return;
    }

    // Calculate offset to base address for multi-register data points.
    const offset = addr - dp.getAddress();

    // Set the value.
    dp.setRegisterValue(value, false, offset, this.endian);

    // Check if the value should be mapped to another data point.
    const feedbackDpId = dp.getFeedbackDataPoint();
    if (feedbackDpId !== undefined && unit.hasDataPoint(feedbackDpId)) {
      // Get the feedback datapoint.
      const feedbackDp = unit.getDataPoint(feedbackDpId);
      feedbackDp?.setRegisterValue(value, true, offset, this.endian);
    }

    // Return success.
    cb(null, value);
  }

  // ~~~~~ Getter & Setter ~~~~~

  /**
   * Gets the file name of the Modbus device.
   * @returns The file name of the Modbus device.
   */
  public getFilename(): string {
    return this.filename;
  }

  /**
   * Checks if the Modbus device is enabled.
   * @returns True if the device is enabled, false otherwise.
   */
  public isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Gets the port number of the Modbus device.
   * @returns The port number.
   */
  public getPort(): number {
    return this.port;
  }

  /**
   * Gets the endian format of the Modbus device.
   * @returns The endian format.
   */
  public getEndian(): Endian {
    return this.endian;
  }

  /**
   * Gets the name of the Modbus device.
   * @returns The name of the device.
   */
  public getName(): string {
    return this.name;
  }

  /**
   * Gets the vendor of the Modbus device.
   * @returns The vendor of the device.
   */
  public getVendor(): string {
    return this.vendor;
  }

  /**
   * Gets the description of the Modbus device.
   * @returns The description of the device.
   */
  public getDescription(): string {
    return this.description;
  }

  /**
   * Gets all the units of the Modbus device.
   * @returns An array of Modbus units.
   */
  public getAllUnits(): ModbusUnit[] {
    return Array.from(this.units.values());
  }
}
