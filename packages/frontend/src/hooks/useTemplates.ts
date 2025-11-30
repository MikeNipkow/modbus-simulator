import type { ModbusDevice } from "@/types/ModbusDevice";
import useData from "./useData";

function useTemplates() {
    return useData<ModbusDevice>("/templates");
}

export default useTemplates;