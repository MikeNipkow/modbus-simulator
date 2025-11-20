import { DataPoint } from "./DataPoint.js";
import { DataArea } from "./types/DataArea.js";
import { DataType } from "./types/DataType.js";
import { ParseResult } from "./types/ParseResult.js";

export class ModbusUnit {

    private id                  : number;

    private dataPointsById      : Map<string, DataPoint>                  = new Map();
    private dataPointsByAddr    : Map<DataArea, Map<number, DataPoint>>   = new Map();

    constructor(id: number) {
        // Validate id.
        if (id < 1 || id > 254)
            throw new Error('ModbusUnit id must be between 1 and 254');

        this.id = id;

        // Initialize maps for each DataArea.
        for (const area of Object.values(DataArea) as DataArea[])
            this.dataPointsByAddr.set(area, new Map());
    }

    public hasDataPoint(id: string): boolean {
        return this.dataPointsById.has(id);
    }

    public getDataPoint(id: string): DataPoint | undefined {
        return this.dataPointsById.get(id);
    }

    public hasDataPointAt(area: DataArea, address: number): boolean {
        return this.dataPointsByAddr.get(area)?.has(address) ?? false;
    }

    public getDataPointAt(area: DataArea, address: number): DataPoint | undefined {
        return this.dataPointsByAddr.get(area)?.get(address);
    }

    public addDataPoint(dataPoint: DataPoint): ParseResult<DataPoint> {
        // Validate dataPoint.
        if (!dataPoint) 
            throw new Error('Cannot add undefined DataPoint to ModbusUnit');

        // Collect errors.
        const errors: string[] = [];

        // Check for duplicate id.
        if (this.hasDataPoint(dataPoint.getId())) {
           errors.push(`DataPoint with id '${dataPoint.getId()}' already exists in ModbusUnit ${this.id}`);
           return { success: false, errors: errors };
        }

        // Check if address is already occupied in any of the areas.
        for (const address of dataPoint.getOccupiedAddresses()) {
            for (const area of dataPoint.getAreas()) {
                if (this.hasDataPointAt(area, address)) {
                    errors.push(`Address ${address} in area ${area} is already occupied in ModbusUnit ${this.id}`);
                    return { success: false, errors: errors };
                }
            }
        }

        // Check if type is compatible with areas.
        for (const area of dataPoint.getAreas()) {
            if ((area === DataArea.Coil || area === DataArea.DiscreteInput) && dataPoint.getType() !== DataType.Bool) {
                errors.push(`DataPoint of type ${dataPoint.getType()} cannot be added to area ${area}`);
                return { success: false, errors: errors };
            }
        }

        // Add dataPoint to maps.
        this.dataPointsById.set(dataPoint.getId(), dataPoint);
        for (const address of dataPoint.getOccupiedAddresses())
            for (const area of dataPoint.getAreas())
                this.dataPointsByAddr.get(area)?.set(address, dataPoint);

        return { success: true, value: dataPoint };
    }

    public deleteDataPoint(id: string): boolean {
        // Find the dataPoint.
        const dataPoint = this.dataPointsById.get(id);
        if (!dataPoint)
            return false;

        // Remove from address map.
        for (const address of dataPoint.getOccupiedAddresses())
            for (const area of dataPoint.getAreas())
                this.dataPointsByAddr.get(area)?.delete(address);

        // Remove from id map.
        this.dataPointsById.delete(id);

        return true;
    }

    public deleteDataPointFromArea(id: string, area: DataArea): boolean {
        // Find the dataPoint.
        const dataPoint = this.getDataPoint(id);
        if (!dataPoint)
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

    public getAllDataPoints(): DataPoint[] {
        return Array.from(this.dataPointsById.values());
    }

    // ~~~~~ Getter & Setter ~~~~~

    setUnitId(id: number): void {
        // Validate id.
        if (id < 1 || id > 254)
            throw new Error('ModbusUnit id must be between 1 and 254');

        this.id = id;
    }

    public getId(): number {
        return this.id;
    }



}