import { Request, Response } from "express";
import { getDeviceFromRequest } from "./deviceController.js";
import { fromJSON, fromModbusUnit, modbusUnitFromDTO } from "../mapper/ModbusUnitDTOMapper.js";
import { ModbusUnitDTO } from "../dto/ModbusUnitDTO.js";
import { ModbusUnit } from "../../ModbusUnit.js";
import deviceManager from "../../app.js";

export const getUnitFromRequest = (req: Request, res: Response): ModbusUnit | undefined => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return undefined;

    if (!req.params.unitId) {
        res.status(400).json({ error: 'Unit id parameter is required' });
        return undefined;
    }
    const unitId = parseInt(req.params.unitId, 10);
    if (isNaN(unitId) || unitId < 1 || unitId > 254) {
        res.status(400).json({ error: 'Unit id must be a valid number between 1 and 254' });
        return undefined;
    }

    const unit = device.getUnit(unitId);
    if (!unit) {
        res.status(404).json({ error: `Unit with id ${unitId} not found in device ${device.getId()}` });
        return undefined;
    }

    return unit;
};

export const getUnitsRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;

    const unitsDTO: ModbusUnitDTO[] = [];
    device.getAllUnits().forEach((unit) => unitsDTO.push(fromModbusUnit(unit)));

    res.json(unitsDTO);
}

export const getUnitRoute = (req: Request, res: Response) => {
    const unit = getUnitFromRequest(req, res);
    if (!unit) return;

    const unitDTO = fromModbusUnit(unit);
    res.json(unitDTO);
}

export const createUnitRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;

    const unitId = req.body.id;
    if (unitId === undefined || unitId === null) {
        res.status(400).json({ error: 'Unit id is required' });
        return;
    }
    if (typeof unitId !== 'number' || isNaN(unitId) || unitId < 1 || unitId > 254) {
        res.status(400).json({ error: 'Unit id must be a valid number between 1 and 254' });
        return;
    }
    if (device.hasUnit(unitId)) {
        res.status(409).json({ error: `Unit with id ${unitId} already exists in device ${device.getId()}` });
        return;
    }
    const unit = new ModbusUnit(unitId);
    device.addUnit(unit);
    deviceManager.saveDevice(device.getId());
    const unitDTO = fromModbusUnit(unit);
    res.status(201).json(unitDTO);
}

export const deleteUnitRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;

    const unit = getUnitFromRequest(req, res);
    if (!unit) return;

    device.deleteUnit(unit.getId());
    deviceManager.saveDevice(device.getId());

    res.status(204).send();
}

export const updateUnitRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;
    const unit = getUnitFromRequest(req, res);
    if (!unit) return;

    const parseResult = fromJSON(req.body);
    if (!parseResult.success) {
        res.status(400).json({ errors: parseResult.errors });
        return;
    }

    const unitDTO = parseResult.value;
    
    // Try to parse new unit from DTO.
    const newUnitResult = modbusUnitFromDTO(unitDTO);
    if (!newUnitResult.success) {
        res.status(400).json({ errors: newUnitResult.errors });
        return;
    }

    // Delete existing unit and replace with new one.
    if (!device.deleteUnit(unit.getId())) {
        res.status(500).json({ error: `Failed to delete existing unit with id ${unit.getId()}` });
        return;
    }

    // Try to add new unit.
    const newUnit = newUnitResult.value;
    const addResult = device.addUnit(newUnit);
    if (!addResult) {
        // Restore old unit.
        device.addUnit(unit);

        res.status(500).json({ error: `Failed to add new unit with id ${newUnit.getId()}` });
        return;
    }

    deviceManager.saveDevice(device.getId());
    res.json(fromModbusUnit(newUnit));
}