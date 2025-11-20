import { Endian } from "../../types/Endian.js";
import { ModbusUnitDTO } from "./ModbusUnitDTO.js";

export interface ModbusDeviceDTO {
    fileName    : string;
    enabled     : boolean;
    port        : number;
    endian      : Endian;
    name        : string;
    vendor      : string;
    description : string;
    units       : ModbusUnitDTO[];

    running     : boolean;
}