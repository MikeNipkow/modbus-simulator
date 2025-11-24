import { AccessMode } from "./types/enums/AccessMode.js";
import { DataArea } from "./types/enums/DataArea.js";
import { DataPointProps } from "./types/DataPointProps.js";
import { DataType } from "./types/enums/DataType.js";
import { Endian } from "./types/enums/Endian.js";
import { SimulationProps } from "./types/SimulationProps.js";
import { getDataViewFromValue, getDefaultValueForType, getRegisterLengthFromType, getValueFromDataView } from "./util/modbusUtils.js";

/**
 * Represents a Modbus DataPoint with various properties and behaviors.
 */
export class DataPoint {

    private readonly id         : string;               // Unique identifier.
    private readonly type       : DataType;             // Data type of the datapoint.
    private readonly length     : number;               // Length of the datapoint (in modbus registers).

    private areas               : DataArea[];           // Data areas the datapoint belongs to.
    private address             : number;               // Base modbus address of the datapoint.
    private accessMode          : AccessMode;           // Access mode of the datapoint.

    private name                : string;               // Human-readable name of the datapoint.
    private unit                : string;               // Unit of measurement for the datapoint.
    private simulation          : SimulationProps;      // Simulation properties for the datapoint.

    private defaultValue        : boolean | number | bigint | string;   // Default value of the datapoint.
    private value               : boolean | number | bigint | string;   // Current value of the datapoint.

    private feedbackDataPoint   : string | undefined;   // ID of the datapoint used for feedback (if any).
    
    private simulationInterval  : NodeJS.Timeout | undefined = undefined;   // Interval for simulation updates.

    /**
     * Creates a new DataPoint instance.
     * @param props Properties for the DataPoint.
     * @throws Error if required properties are missing or invalid.
     */
    constructor(props: DataPointProps) {
        // Validate required properties.
        if (!props.id)                                                      throw new Error('DataPoint must have an id');
        if (!props.areas || props.areas.length === 0)                       throw new Error('DataPoint must have at least one DataArea');
        if (!props.type)                                                    throw new Error('DataPoint must have a DataType');
        if (props.address < 0 || props.address > 65535)                     throw new Error('DataPoint must have a valid address');
        if (!props.accessMode)                                              throw new Error('DataPoint must have an AccessMode');
        if (props.length !== undefined && props.length <= 0)                throw new Error('DataPoint length must be greater than 0');
        if (props.type === DataType.ASCII && props.length === undefined)    throw new Error('DataPoint of type String must have a length defined');
        
        // Check length for ASCII type.
        if (props.type === DataType.ASCII && props.length !== undefined && props.defaultValue !== undefined
            && (props.defaultValue as string).length/2 > props.length) 
            throw new Error('DataPoint defaultValue length exceeds defined length for String type');

        // Initialize properties.
        this.id                 = props.id;
        this.areas              = props.areas;
        this.type               = props.type;
        this.address            = props.address;
        this.accessMode         = props.accessMode;
        this.length             = props.length          ?? getRegisterLengthFromType(this.type);
        this.name               = props.name            ?? '';
        this.unit               = props.unit            ?? '';
        this.simulation         = props.simulation      ?? { enabled: false, minValue: 0, maxValue: 1 };
        this.feedbackDataPoint  = props.feedbackDataPoint;
        this.defaultValue       = props.defaultValue    ?? getDefaultValueForType(this.type);
        this.value              = this.defaultValue;

        // Set simulation properties only for valid types.
        if (this.type !== DataType.ASCII) {
            this.simulation = props.simulation ?? {
                enabled: false,
                minValue: 0,
                maxValue: 1
            };
        }
    }


    // ~~~~~ Value Handling ~~~~~√

    /**
     * Gets the current value of the DataPoint.
     * @returns The current value of the DataPoint.
     */
    public getValue(): boolean | number | bigint | string {
        return this.value;
    }

    /**
     * Sets the current value of the DataPoint.
     * @param value The new value to set.
     * @param force If true, forces the value to be set even if the DataPoint is read-only.
     * @returns True if the value was set successfully, false otherwise.
     */
    public setValue(value: boolean | number | bigint | string, force: boolean = false): boolean {
        // If read-only and not forced, do not set the value.
        if (!this.hasWriteAccess() && !force)
            return false;

        this.value = value;
        return true;
    }

    /**
     * Checks if the DataPoint has read access.
     * @returns True if the DataPoint has read access, false otherwise.
     */
    public hasReadAccess(): boolean {
        return this.accessMode === AccessMode.ReadOnly || this.accessMode === AccessMode.ReadWrite;
    }

    /**
     * Checks if the DataPoint has write access.
     * @returns True if the DataPoint has write access, false otherwise.
     */
    public hasWriteAccess(): boolean {
        return this.accessMode === AccessMode.WriteOnly || this.accessMode === AccessMode.ReadWrite;
    }


    // ~~~~~ Modbus Value Handling ~~~~~

    /**
     * Gets the value of the datapoint as a Modbus register value.
     * @param offset Offset of the register to read.
     * @param endian Endianess of the register value.
     * @returns The value of the register.
     * @throws Error if the offset is invalid.
     */
    public getRegisterValue(offset: number = 0, endian: Endian = Endian.BigEndian): boolean | number {
        // Return value directly for Bool types.
        if (this.type === DataType.Bool)
            return this.value as boolean;

        // Return value directly for single-register types.
        if (this.type === DataType.Byte     ||
            this.type === DataType.Int16    || 
            this.type === DataType.UInt16)
            return this.value as number;
        
        // Check if offset is valid.
        if (offset < 0 || offset >= this.getLength())
            throw new Error(`Invalid offset ${offset} for datapoint ${this.getId()}`);

        // Create DataView for multi-register types (required to access individual bytes).
        const dataView: DataView = getDataViewFromValue(this);

        // Get index to read, depending on endian.
        const index = endian === Endian.BigEndian ? offset * 2 : (this.getLength()*2 - 2 - offset * 2);

        // Return the register value.
        return dataView.getUint16(index);
    }

    /**
     * Sets the value of the datapoint as a Modbus register value.
     * @param value The value to set.
     * @param force Whether to force the value set, ignoring access restrictions.
     * @param offset Offset of the register to write.
     * @param endian Endianess of the register value.
     * @returns True if the value was set successfully, false otherwise.
     * @throws Error if the offset is invalid.
     */
    public setRegisterValue(value: number, force: boolean = false, offset: number = 0, endian: Endian = Endian.BigEndian): boolean {
        // Check if datapoint is read-only.
        if (!this.hasWriteAccess() && !force)
            return false;

        // Set value directly for Bool and numeric single-register types.
        if (this.type === DataType.Bool     ||
            this.type === DataType.Byte     ||
            this.type === DataType.Int16    || 
            this.type === DataType.UInt16
        ) {
            this.value = value;
            return true;
        }

        // Check if offset is valid.
        if (offset < 0 || offset >= this.getLength())
            throw new Error(`Invalid offset ${offset} for datapoint ${this.getId()}`);

        // Create DataView for multi-register types.
        const dataView: DataView = getDataViewFromValue(this);

        // Get index to read, depending on endian.
        const index = endian === Endian.BigEndian ? offset * 2 : (this.getLength()*2 - 2 - offset * 2);

        // Change the correct bytes.
        dataView.setUint16(index, value);

        // Set the new value for this data point.
        return this.setValue(getValueFromDataView(dataView, this), force);
    }


    // ~~~~~ Data Areas ~~~~~

    /**
     * Adds a DataArea to the DataPoint.
     * @param area The DataArea to add.
     * @throws Error if the area is not compatible with the DataPoint type.
     */
    public addDataArea(area: DataArea): void {
        // Check if area is valid for this datapoint.
        if ((area === DataArea.Coil || area === DataArea.DiscreteInput) && this.type !== DataType.Bool)
            throw new Error(`DataPoint of type ${this.type} cannot have area ${area}`);

        // Add area if not already present.
        if (!this.hasDataArea(area))
            this.areas.push(area);
    }

    /**
     * Deletes a DataArea from the DataPoint.
     * @param area The DataArea to delete.
     * @throws Error if trying to delete the last remaining area.
     */
    public deleteDataArea(area: DataArea): void {
        // Check if at least one area remains.
        if (this.areas.length <= 1)
            throw new Error('DataPoint must have at least one DataArea');

        this.areas = this.areas.filter(a => a !== area);
    }

    /**
     * Checks if the DataPoint has the specified DataArea.
     * @param area The DataArea to check.
     * @returns True if the DataPoint has the specified DataArea, false otherwise.
     */
    public hasDataArea(area: DataArea): boolean {
        return this.areas.includes(area);
    }


    // ~~~~~ Simulation ~~~~~

    /**
     * Gets the simulation properties of the DataPoint.
     * @returns The simulation properties of the DataPoint.
     */
    public getSimulation(): SimulationProps {
        return this.simulation;
    }

    /**
     * Checks if simulation is enabled for the DataPoint.
     * @returns True if simulation is enabled, false otherwise.
     */
    public isSimulationEnabled(): boolean {
        return this.simulation.enabled;
    }

    /**
     * Enables simulation for the data point and starts it.
     */
    public enableSimulation(): void {
        this.simulation.enabled = true;
        this.startSimulation();
    }

    /**
     * Disables simulation for the data point and stops it.
     */
    public disableSimulation(): void {
        this.simulation.enabled = false;
        this.stopSimulation();
    }

    /**
     * Checks if the simulation is currently running.
     * @returns True if simulation is running, false otherwise.
     */
    public isSimulationRunning(): boolean {
        return this.simulationInterval !== undefined;
    }

    /**
     * Starts the simulation for the data point.
     * @param intervalMs Interval in milliseconds for value changes.
     * @returns True if simulation started successfully, false if already running.
     */
    public startSimulation(intervalMs: number = 1000): boolean {
        // Check if type allows simulation.
        if (this.type === DataType.ASCII)
            return false;

        // Check if simulation is already running.
        if (this.isSimulationRunning()) 
            return false;

        // Start the simulation.
        this.simulationInterval = setInterval(() => {
            // Generate and set a new random value.
            this.setValue(this.generateRandomValue(), true);
        }, intervalMs);

        return true;
    }

    /**
     * Stops the simulation for the data point.
     * @returns True if simulation stopped successfully, false if not running.
     */
    public stopSimulation(): boolean {
        // Check if simulation is running.
        if (!this.isSimulationRunning()) 
            return false;

        // Stop the simulation.
        clearInterval(this.simulationInterval);
        this.simulationInterval = undefined;

        return true;
    }

    /**
     * Generates a random value within the min and max range.
     * @returns A randomly generated value within the min and max range.
     */
    private generateRandomValue(): boolean | number | bigint | string {
        // Toggle if type is Boolean.
        if (this.type === DataType.Bool)
            return !(this.value as boolean);

        // Generation for number type.
        // Calculate range.
        const min = this.simulation.minValue as number;
        const max = this.simulation.maxValue as number;
        const range = max - min;

        // Generate random number within range.
        let random = min + range * Math.random();

        // Round number, if datapoint type is not a float.
        if (this.getType() !== DataType.Float32 && this.getType() !== DataType.Float64)
            return Math.round(random) as number | bigint;

        return random as number | bigint;
    }


    // ~~~~~ Getter & Setter ~~~~~

    /**
     * Gets the unique identifier of the DataPoint.
     * @returns The unique identifier of the DataPoint.
     */
    public getId(): string {
        return this.id;
    }

    /**
     * Gets the data areas of the DataPoint.
     * @returns The data areas of the DataPoint.
     */
    public getAreas(): DataArea[] {
        return this.areas;
    }

    /**
     * Gets the data type of the DataPoint.
     * @returns The data type of the DataPoint.
     */
    public getType(): DataType {
        return this.type;
    }

    /**
     * Gets the base modbus address of the DataPoint.
     * @returns The base modbus address of the DataPoint.
     */
    public getAddress(): number {
        return this.address;
    }

    /**
     * Gets all occupied modbus addresses of the DataPoint.
     * @returns An array of all occupied modbus addresses of the DataPoint.
     */
    public getOccupiedAddresses(): number[] {
        const addresses: number[] = [];
        for (let i = 0; i < this.getLength(); i++)
            addresses.push(this.address + i);

        return addresses;
    }

    /**
     * Gets the access mode of the DataPoint.
     * @returns The access mode of the DataPoint.
     */
    public getAccessMode(): AccessMode {
        return this.accessMode;
    }

    /**
     * Gets the length of the DataPoint (in modbus registers).
     * @returns The length of the DataPoint.
     */
    public getLength(): number {
        return this.length;
    }

    /**
     * Gets the default value of the DataPoint.
     * @returns The default value of the DataPoint.
     */
    public getDefaultValue(): boolean | number | bigint | string {
        return this.defaultValue;
    }

    /**
     * Gets the name of the DataPoint.
     * @returns The name of the DataPoint.
     */
    public getName(): string {
        return this.name;
    }

    /**
     * Gets the unit of the DataPoint.
     * @returns The unit of the DataPoint.
     */
    public getUnit(): string {
        return this.unit;
    }

    /**
     * Gets the feedback DataPoint identifier.
     * @returns The feedback DataPoint identifier, or undefined if not set.
     */
    public getFeedbackDataPoint(): string | undefined {
        return this.feedbackDataPoint;
    }

    /**
     * Checks if the DataPoint has a feedback DataPoint identifier.
     * @returns True if a feedback DataPoint identifier is set, false otherwise.
     */
    public hasFeedbackDataPoint(): boolean {
        return this.feedbackDataPoint !== undefined;
    }

}