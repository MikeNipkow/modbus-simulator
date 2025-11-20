import { AccessMode } from "./types/AccessMode.js";
import { DataArea } from "./types/DataArea.js";
import { DataPointProps } from "./types/DataPointProps.js";
import { DataType } from "./types/DataType.js";
import { Endian } from "./types/Endian.js";
import { SimulationProps } from "./types/SimulationProps.js";
import { getDataViewFromValue, getDefaultValueForType, getRegisterLengthFromType, getValueFromDataView } from "./util/modbusUtils.js";

export class DataPoint {

    private readonly id         : string;
    private readonly type       : DataType;
    private readonly length     : number;

    private areas               : DataArea[];
    private address             : number;
    private accessMode          : AccessMode;

    private name                : string;
    private unit                : string;
    private simulation          : SimulationProps;
    private simulationInterval  : NodeJS.Timeout | undefined = undefined;

    private feedbackDataPoint   : string | undefined;

    private defaultValue        : boolean | number | bigint | string;
    private value               : boolean | number | bigint | string;

    constructor(props: DataPointProps) {
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

    // ~~~~~ Modbus Value ~~~~~

    public getRegisterValue(offset?: number, endian?: Endian): boolean | number {
        if (this.type === DataType.Bool)
            return this.value as boolean;

        if (this.type == DataType.Byte      ||
            this.type === DataType.Int16    || 
            this.type === DataType.UInt16)
            return this.value as number;

        // Create DataView for multi-register types.
        const dataView: DataView = getDataViewFromValue(this);

        // Get index to read, depending on endian.
        if (offset === undefined || offset < 0)
            offset = 0;
        if (offset >= this.getLength())
            offset = this.getLength() - 1;
        const index = endian === Endian.BigEndian ? offset * 2 : (this.getLength()*2 - 2 - offset * 2);

        return dataView.getUint16(index);
    }

    public setRegisterValue(value: number, force: boolean = false, offset: number = 0, endian: Endian = Endian.BigEndian): boolean {
        // Check if datapoint is read-only.
        if (!this.hasWriteAccess() && !force)
            return false;

        if (this.type === DataType.Bool) {
            this.value = value;
            return true;
        }

        if (this.type == DataType.Byte      ||
            this.type === DataType.Int16    || 
            this.type === DataType.UInt16) {
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

        // Manipulate the correct bytes.
        dataView.setUint16(index, value);

        // Set the new value.
        return this.setValue(getValueFromDataView(dataView, this), force);
    }

    // ~~~~~ Simulation ~~~~~

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
    public startSimulation(saveState: boolean = true, intervalMs: number = 1000): boolean {
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

        // Enable random value changes.
        if (saveState)
            this.simulation.enabled = true;

        return true;
    }

    /**
     * Stops the simulation for the data point.
     * @returns True if simulation stopped successfully, false if not running.
     */
    public stopSimulation(saveState: boolean = true): boolean {
        // Check if simulation is running.
        if (!this.isSimulationRunning()) 
            return false;

        // Stop the simulation.
        clearInterval(this.simulationInterval);
        this.simulationInterval = undefined;

        // Disable random value changes.
        if (saveState)
            this.simulation.enabled = false;

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

    public addDataArea(area: DataArea): void {
        // Check if area is valid for this datapoint.
        if ((area === DataArea.Coil || area === DataArea.DiscreteInput) && this.type !== DataType.Bool)
            throw new Error(`DataPoint of type ${this.type} cannot have area ${area}`);

        // Add area if not already present.
        if (!this.hasDataArea(area))
            this.areas.push(area);
    }

    public deleteDataArea(area: DataArea): void {
        // Check if at least one area remains.
        if (this.areas.length <= 1)
            throw new Error('DataPoint must have at least one DataArea');

        this.areas = this.areas.filter(a => a !== area);
    }

    public hasDataArea(area: DataArea): boolean {
        return this.areas.includes(area);
    }

    // ~~~~~ Getter & Setter ~~~~~

    getId(): string {
        return this.id;
    }

    getAreas(): DataArea[] {
        return this.areas;
    }
    getType(): DataType {
        return this.type;
    }
    getAddress(): number {
        return this.address;
    }
    getOccupiedAddresses(): number[] {
        const addresses: number[] = [];
        for (let i = 0; i < this.getLength(); i++)
            addresses.push(this.address + i);

        return addresses;
    }
    getAccessMode(): AccessMode {
        return this.accessMode;
    }
    getLength(): number {
        return this.length;
    }
    getDefaultValue(): boolean | number | bigint | string {
        return this.defaultValue;
    }
    getName(): string {
        return this.name;
    }
    getUnit(): string {
        return this.unit;
    }
    getSimulation(): SimulationProps {
        return this.simulation;
    }

    getFeedbackDataPoint(): string | undefined {
        return this.feedbackDataPoint;
    }

    hasFeedbackDataPoint(): boolean {
        return this.feedbackDataPoint !== undefined;
    }

    getValue(): boolean | number | bigint | string {
        return this.value;
    }

    setValue(value: boolean | number | bigint | string, force: boolean = false): boolean {
        // If read-only and not forced, do not set the value.
        if (!this.hasWriteAccess() && !force)
            return false;

        this.value = value;
        return true;
    }

    hasReadAccess(): boolean {
        return this.accessMode === AccessMode.ReadOnly || this.accessMode === AccessMode.ReadWrite;
    }

    hasWriteAccess(): boolean {
        return this.accessMode === AccessMode.WriteOnly || this.accessMode === AccessMode.ReadWrite;
    }

    isSimulationEnabled(): boolean {
        return this.simulation.enabled;
    }

}