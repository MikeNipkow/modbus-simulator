import { Request, Response } from "express";
import { getUnitFromRequest } from "./unitController.js";
import { DataPoint } from "../../DataPoint.js";
import { dataPointFromDTO, fromDataPoint, fromJSON } from "../mapper/DataPointDTOMapper.js";
import { getDeviceFromRequest } from "./deviceController.js";
import deviceManager from "../../app.js";
import { DataPointProps } from "../../types/DataPointProps.js";

export const getDataPointFromRequest = (req: Request, res: Response): DataPoint | undefined => {
    const unit = getUnitFromRequest(req, res);
    if (!unit) return undefined;

    if (!req.params.dataPointId) {
        res.status(400).json({ error: 'DataPoint id parameter is required' });
        return undefined;
    }

    const dataPointId = req.params.dataPointId;
    const dataPoint = unit.getDataPoint(dataPointId);
    if (!dataPoint) {
        res.status(404).json({ error: `DataPoint with id ${dataPointId} not found in unit ${unit['id']}` });
        return undefined;
    }

    return dataPoint;
}

export const getDataPointsRoute = (req: Request, res: Response) => {
    const unit = getUnitFromRequest(req, res);
    if (!unit) return;

    const dataPoints = Array.from(unit['dataPointsById'].values().map(dp => fromDataPoint(dp)));

    res.json(dataPoints);
}

export const getDataPointRoute = (req: Request, res: Response) => {
    const dataPoint = getDataPointFromRequest(req, res);
    if (!dataPoint) return;
    const dataPointDTO = fromDataPoint(dataPoint);
    res.json(dataPointDTO);
}

export const createDataPointRoute = (req: Request, res: Response) => {
    const unit = getUnitFromRequest(req, res);
    if (!unit) return;
    const device = getDeviceFromRequest(req, res);
    if (!device) return;

    const parseResult = fromJSON(req.body);
    if (!parseResult.success) {
        res.status(400).json({ errors: parseResult.errors });
        return;
    }

    const dpDTO = parseResult.value;
    const dpProps: DataPointProps = {
        id: dpDTO.id,
        areas: dpDTO.areas,
        type: dpDTO.type,
        address: dpDTO.address,
        accessMode: dpDTO.accessMode,
        length: dpDTO.length,
        defaultValue: dpDTO.defaultValue,
        name: dpDTO.name,
        unit: dpDTO.unit,
        simulation: dpDTO.simulation,
        feedbackDataPoint: dpDTO.feedbackDataPoint
    }

    const dataPoint: DataPoint= new DataPoint(dpProps);  

    const result = unit.addDataPoint(dataPoint);
    if (!result.success) {
        res.status(400).json({ errors: result.errors });
        return;
    }
    deviceManager.saveDevice(device.getId());
    res.status(201).json(fromDataPoint(dataPoint));
}

export const deleteDataPointRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;

    const unit = getUnitFromRequest(req, res);
    if (!unit) return;

    const dataPoint = getDataPointFromRequest(req, res);
    if (!dataPoint) return;

    unit.deleteDataPoint(dataPoint.getId());
    deviceManager.saveDevice(device.getId());

    res.status(204).send();
}

export const updateDataPointRoute = (req: Request, res: Response) => {
    const device = getDeviceFromRequest(req, res);
    if (!device) return;
    const unit = getUnitFromRequest(req, res);
    if (!unit) return;
    const dataPoint = getDataPointFromRequest(req, res);
    if (!dataPoint) return;

    const parseResult = fromJSON(req.body);
    if (!parseResult.success) {
        res.status(400).json({ errors: parseResult.errors });
        return;
    }
    
    const dpDTO = parseResult.value;

    // Create new DataPoint with updated properties.
    const newDpResult = dataPointFromDTO(dpDTO);
    if (!newDpResult.success) {
        res.status(400).json({ errors: newDpResult.errors });
        return;
    }
    const newDp = newDpResult.value;
    newDp.setValue(dpDTO.value)
    
    // Delete and recreate approach.
    const deleteResult = unit.deleteDataPoint(dataPoint.getId());
    if (!deleteResult) {
        // Internal error
        res.status(500).json({ error: 'Failed to delete existing DataPoint for update' });
        return;
    }

    // Try to add the new DataPoint
    const addResult = unit.addDataPoint(newDp);
    if (!addResult.success) {
        // Re-add the old DataPoint to maintain state
        unit.addDataPoint(dataPoint);

        res.status(400).json({ errors: addResult.errors });
        return;
    }

    deviceManager.saveDevice(device.getId());
    const updatedDataPoint = unit.getDataPoint(dataPoint.getId());
    res.json(fromDataPoint(updatedDataPoint!));
}