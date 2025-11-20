import { DataPointDTO } from "./DataPointDTO.js";

export type ModbusUnitDTO = {
    id          : number;
    dataPoints  : DataPointDTO[];
};