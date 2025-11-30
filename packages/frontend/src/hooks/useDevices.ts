import type { ModbusDevice } from "@/types/ModbusDevice";
import useData from "./useData";

function useDevices() {
    return useData<ModbusDevice>("/devices");
}

export default useDevices;