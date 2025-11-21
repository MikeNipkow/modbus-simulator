import { ModbusUnit } from "./ModbusUnit.js";
import { DataArea } from "./types/DataArea.js";
import { Endian } from "./types/Endian.js";
import Modbus, { FCallbackVal } from "modbus-serial";
import { ModbusError } from "./types/ModbusError.js";

// TODO: id may only be alphanumeric and underscores with .json ending.
export class ModbusDevice implements Modbus.IServiceVector {
    
    // Device info.
    private readonly id     : string;
    private enabled         : boolean;
    private port            : number
    private endian          : Endian = Endian.BigEndian;
    private name            : string;
    private vendor          : string;
    private description     : string;

    // Different modbus units (Unit-ID 1-254) with different data points.
    private units           : Map<number, ModbusUnit> = new Map(); // <Unit-ID>, ModbusUnit>

    // Modbus server instance.
    private server          : Modbus.ServerTCP | undefined;
    private running         : boolean = false;

    constructor(id: string, enabled: boolean, port: number, endian: Endian, name: string, vendor: string, description: string) {
        // Validate ID.
        if (id === undefined || id.trim() === '')
            throw new Error('ModbusDevice must have a valid non-empty ID');
        
        // Check for valid port.
        if (port < 1 || port > 65535)
            throw new Error('ModbusDevice port must be between 1 and 65535');

        this.id             = id;
        this.enabled        = enabled;
        this.port           = port;
        this.endian         = endian;
        this.name           = name;
        this.vendor         = vendor;
        this.description    = description;
    }

    public hasUnit(id: number): boolean {
        return this.units.has(id);
    }

    public getUnit(id: number): ModbusUnit | undefined {
        return this.units.get(id);
    }

    public addUnit(unit: ModbusUnit): boolean {
        // Validate unit.
        if (unit === undefined || this.hasUnit(unit.getId())) 
            return false;

        this.units.set(unit.getId(), unit);
        return true;
    }

    public deleteUnit(id: number): boolean {
        return this.units.delete(id);
    }

    public startAllEnabledSimulations(): void {
        for (const unit of this.units.values())
            for (const dp of unit.getAllDataPoints())
                if (dp.isSimulationEnabled())
                    dp.startSimulation();
    }

    public stopAllSimulations(): void {
        for (const unit of this.units.values())
            for (const dp of unit.getAllDataPoints())
                dp.stopSimulation();
    }

    // ~~~~~ Modbus Server ~~~~~

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
    public startServer(saveState: boolean = true, timeoutMs: number = 3000): Promise<{ success: boolean; message: string }> {
        // Check if server is already running.
        if(this.isRunning())
            return Promise.resolve({ success: false, message: `Modbus server on device '${this.name}' is already running` });

        return new Promise((resolve) => {
            // Try to open the Modbus server socket.
            this.server = new Modbus.ServerTCP(this, { 
                host: '0.0.0.0', 
                port: this.port 
            });

            if (saveState)
                this.enabled = true;

            // Check if server was started successfully.
            this.server.on('initialized', () => {
                // Stop the timeout timer.
                clearTimeout(timeout);

                this.running = true;
                return resolve({ success: true, message: `Modbus server started on device '${this.name}' using port ${this.port}` });
            });

            // Handle server errors.
            this.server.on("serverError", (err: any) => {
                // Stop the timeout timer.
                clearTimeout(timeout);

                this.running = false;

                if (err?.message?.match(/EADDRINUSE/))
                    return resolve({ success: false, message: `Failed to start Modbus server on device '${this.name}': Port ${this.port} is already in use` });
                else
                    return resolve({ success: false, message: `Modbus server error on device '${this.name}': ${err.message}` });
            });

            // Timeout if no response within the specified timeoutMs.
            const timeout = setTimeout(() => {
                this.running = false;
                return resolve({ success: false, message: `Failed to start Modbus server on device '${this.name}': Timeout` });
            }, timeoutMs);
        });
    }

    /**
     * Stops the Modbus server.
     * @returns A promise that resolves with the result of the server stop attempt and a message.
     */
    public stopServer(saveState: boolean = true): Promise<{ success: boolean; message: string }> {
        // Check if server is already stopped.
        if (!this.isRunning())
            return Promise.resolve({ success: false, message: `Modbus server on device '${this.name}' is already stopped` });

        return new Promise<{ success: boolean; message: string }>((resolve) => {
            // Check if server is running.
            if (!this.isRunning())
                return resolve({ success: false, message: `Modbus server on device '${this.name}' is not running` });
            
            // Close server.
            this.server?.close((err: any) => {
                // Check for errors.
                if (err)
                    return resolve({ success: false, message: `Failed to stopped Modbus server on device '${this.name}': ${err}` });
                
                this.running = false;
                return resolve({ success: true, message: `Modbus server on device '${this.name}' stopped successfully` });
            });
        }).then((result) => {
            if (saveState)
                this.enabled = false;

            return result;
        });
    }

    // ~~~~~ Modbus communication ~~~~~

    /**
     * Modbus request handler for discrete inputs.
     * @param addr The address of the data point.
     * @param unitID The ID of the unit to read from.
     * @param cb The callback function to call with the result.
     */
    public getDiscreteInput(addr: number, unitID: number, cb: FCallbackVal<boolean>): void {
        this.handleReadRequest(DataArea.DiscreteInput, addr, unitID, cb);
    }

    /**
     * Modbus request handler for coils.
     * @param addr The address of the data point.
     * @param unitID The ID of the unit to read from.
     * @param cb The callback function to call with the result.
     */
    public getCoil(addr: number, unitID: number, cb: FCallbackVal<boolean>): void {
        this.handleReadRequest(DataArea.Coil, addr, unitID, cb);
    }

    /**
     * Modbus request handler for reading holding registers.
     * @param addr The address of the data point.
     * @param unitID The ID of the unit to read from.
     * @param cb The callback function to call with the result.
     */
    public getHoldingRegister(addr: number, unitID: number, cb: FCallbackVal<number>): void {
        this.handleReadRequest(DataArea.HoldingRegister, addr, unitID, cb);
    }

    /**
     * Modbus request handler for reading input registers.
     * @param addr The address of the data point.
     * @param unitID The ID of the unit to read from.
     * @param cb The callback function to call with the result.
     */
    public getInputRegister(addr: number, unitID: number, cb: FCallbackVal<number>): void {
        this.handleReadRequest(DataArea.InputRegister, addr, unitID, cb);
    }

    /**
     * Modbus request handler for setting coils.
     * @param addr The address of the data point.
     * @param value The value to set.
     * @param unitID The ID of the unit to write to.
     * @param cb The callback function to call with the result.
     */
    public setCoil(addr: number, value: boolean, unitID: number, cb: FCallbackVal<any>): void {
        this.handleWriteRequest(DataArea.Coil, addr, unitID, value, cb);
    }

    /**
     * Modbus request handler for setting holding registers.
     * @param addr The address of the data point.
     * @param value The value to set.
     * @param unitID The ID of the unit to write to.
     * @param cb The callback function to call with the result.
     */
    public setRegister(addr: number, value: number, unitID: number, cb: FCallbackVal<any>): void {
        this.handleWriteRequest(DataArea.HoldingRegister, addr, unitID, value, cb);
    }

    /**
     * Handles a read request for a specific data point.
     * @param area The data area to read from.
     * @param addr The address of the data point.
     * @param unitID The ID of the unit to read from.
     * @param cb The callback function to call with the result.
     */
    private handleReadRequest(area: DataArea, addr: number, unitID: number, cb: FCallbackVal<any>): void {
        // Check if unit exists.
        const unit = this.getUnit(unitID);
        if (unit === undefined) {
            cb({ modbusErrorCode: ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND } as any, null);
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
    private handleWriteRequest(area: DataArea, addr: number, unitID: number, value: any, cb: FCallbackVal<any>): void {
        // Check if unit exists.
        const unit = this.getUnit(unitID);
        if (unit === undefined) {
            cb({ modbusErrorCode: ModbusError.GATEWAY_TARGET_FAILED_TO_RESPOND } as any, null);
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

    getId(): string {
        return this.id;
    }

    public isEnabled(): boolean {
        return this.enabled;
    }

    getPort(): number {
        return this.port;
    }

    getEndian(): Endian {
        return this.endian;
    }

    getName(): string {
        return this.name;
    }

    getVendor(): string {
        return this.vendor;
    }   

    getDescription(): string {
        return this.description;
    }

    getAllUnits(): ModbusUnit[] {
        return Array.from(this.units.values());
    }

}