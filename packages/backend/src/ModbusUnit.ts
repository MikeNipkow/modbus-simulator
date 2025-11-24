import { DataPoint } from "./DataPoint.js";
import { DataArea } from "./types/enums/DataArea.js";
import { DataType } from "./types/enums/DataType.js";
import { ModbusUnitProps } from "./types/ModbusUnitProps.js";
import { ParseResult } from "./types/enums/ParseResult.js";

/**
 * Represents a Modbus Unit containing multiple DataPoints.
 */
export class ModbusUnit {

    private unitId                  : number;   // Modbus Unit ID (1-254).

    private dataPointsById      : Map<string, DataPoint>                  = new Map();  // Map of DataPoints by their unique id.
    private dataPointsByAddr    : Map<DataArea, Map<number, DataPoint>>   = new Map();  // Map of DataPoints by their address within each DataArea.

    /**
     * Creates a new ModbusUnit.
     * @param props The properties of the ModbusUnit.
     * @returns The created ModbusUnit.
     */
    constructor(props: ModbusUnitProps) {
        // Validate id.
        if (props.unitId < 1 || props.unitId > 254)
            throw new Error('ModbusUnit id must be between 1 and 254');
        this.unitId = props.unitId;

        // Initialize maps for each DataArea.
        for (const area of Object.values(DataArea) as DataArea[])
            this.dataPointsByAddr.set(area, new Map());

        // Check if dataPoints are provided.
        if (!props.dataPoints) 
            return;

        // Add provided dataPoints.
        for (const dpProps of props.dataPoints) {
            const dp        = new DataPoint(dpProps);
            const result    = this.addDataPoint(dp);

            // Check for errors.
            if (!result.success)
                throw new Error(`Failed to add DataPoint with id '${dp.getId()}' to ModbusUnit ${this.unitId}: ${result.errors}`);
        }
    }

    // ~~~~~ DataPoint Management ~~~~~

    /**
     * Checks if a DataPoint with the given id exists in the ModbusUnit.
     * @param id The unique identifier of the DataPoint.
     * @returns True if the DataPoint exists, false otherwise.
     */
    public hasDataPoint(id: string): boolean {
        return this.dataPointsById.has(id);
    }

    /**
     * Checks if a DataPoint exists at the given area and address.
     * @param area The DataArea to check.
     * @param address The address within the DataArea.
     * @returns True if a DataPoint exists at the specified location, false otherwise.
     */
    public hasDataPointAt(area: DataArea, address: number): boolean {
        return this.dataPointsByAddr.get(area)?.has(address) ?? false;
    }

    /**
     * Retrieves a DataPoint by its unique identifier.
     * @param id The unique identifier of the DataPoint.
     * @returns The DataPoint if found, undefined otherwise.
     */
    public getDataPoint(id: string): DataPoint | undefined {
        return this.dataPointsById.get(id);
    }

    /**
     * Retrieves a DataPoint at the given area and address.
     * @param area The DataArea to check.
     * @param address The address within the DataArea.
     * @returns The DataPoint if found, undefined otherwise.
     */
    public getDataPointAt(area: DataArea, address: number): DataPoint | undefined {
        return this.dataPointsByAddr.get(area)?.get(address);
    }

    /**
     * Adds a DataPoint to the ModbusUnit after validating for conflicts.
     * @param dataPoint The DataPoint to add. 
     * @returns A ParseResult indicating success or failure with errors.
     */
    public addDataPoint(dataPoint: DataPoint): ParseResult<DataPoint> {
        // Validate dataPoint.
        if (!(dataPoint instanceof DataPoint)) 
            throw new Error('Cannot add undefined DataPoint to ModbusUnit');

        // Collect errors.
        const errors: string[] = [];

        // Check if type is compatible with areas.
        for (const area of dataPoint.getAreas()) {
            if ((area === DataArea.Coil || area === DataArea.DiscreteInput) && dataPoint.getType() !== DataType.Bool) {
                errors.push(`DataPoint of type ${dataPoint.getType()} cannot be added to area ${area}`);
                return { success: false, errors: errors };
            }
        }

        // Check for duplicate id.
        if (this.hasDataPoint(dataPoint.getId())) {
           errors.push(`DataPoint with id '${dataPoint.getId()}' already exists in ModbusUnit ${this.unitId}`);
           return { success: false, errors: errors };
        }

        // Check if address is already occupied in any of the areas.
        for (const address of dataPoint.getOccupiedAddresses()) {
            for (const area of dataPoint.getAreas()) {
                if (this.hasDataPointAt(area, address)) {
                    errors.push(`Address ${address} in area ${area} is already occupied in ModbusUnit ${this.unitId}`);
                    return { success: false, errors: errors };
                }
            }
        }

        // Add dataPoint to maps.
        this.dataPointsById.set(dataPoint.getId(), dataPoint);
        for (const address of dataPoint.getOccupiedAddresses())
            for (const area of dataPoint.getAreas())
                this.dataPointsByAddr.get(area)?.set(address, dataPoint);

        return { success: true, value: dataPoint };
    }

    /**
     * Deletes a DataPoint by its unique identifier.
     * @param id The unique identifier of the DataPoint to delete.
     * @returns True if the DataPoint was deleted, false if not found.
     */
    public deleteDataPoint(id: string): boolean {
        // Find the dataPoint.
        const dataPoint = this.getDataPoint(id);
        if (!(dataPoint instanceof DataPoint))
            return false;

        // Remove from address map.
        for (const address of dataPoint.getOccupiedAddresses())
            for (const area of dataPoint.getAreas())
                this.dataPointsByAddr.get(area)?.delete(address);

        // Remove from id map.
        this.dataPointsById.delete(id);

        return true;
    }

    /**
     * Deletes a DataPoint from a certain DataArea.
     * @param id The unique identifier of the DataPoint.
     * @param area The DataArea to delete.
     * @returns True if the DataArea was deleted, false if not found or if it is the last remaining area.
     */
    public deleteDataPointFromArea(id: string, area: DataArea): boolean {
        // Find the dataPoint.
        const dataPoint = this.getDataPoint(id);
        if (!(dataPoint instanceof DataPoint))
            return false;

        // Check if at least one area remains.
        if (dataPoint.getAreas().length <= 1)
            return false;

        // Remove area from dataPoint.
        dataPoint.deleteDataArea(area);

        // Remove from address map.
        for (const address of dataPoint.getOccupiedAddresses())
            this.dataPointsByAddr.get(area)?.delete(address);

        return true;
    }

    /**
     * Retrieves all DataPoints in the ModbusUnit.
     * @returns All DataPoints in the ModbusUnit.
     */
    public getAllDataPoints(): DataPoint[] {
        return Array.from(this.dataPointsById.values());
    }

    // ~~~~~ Getter & Setter ~~~~~

    /**
     * Sets the Modbus Unit ID.
     * @param id The new unit ID.
     */
    setUnitId(id: number): void {
        // Validate id.
        if (id < 1 || id > 254)
            throw new Error('ModbusUnit id must be between 1 and 254');

        this.unitId = id;
    }

    /**
     * Gets the Modbus Unit ID.
     * @returns The Modbus Unit ID.
     */
    public getId(): number {
        return this.unitId;
    }

}