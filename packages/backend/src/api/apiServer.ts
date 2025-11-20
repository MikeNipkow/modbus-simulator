import express from 'express';
import { createDeviceRoute, deleteDeviceRoute, getDeviceRoute, getDevicesRoute } from './controllers/deviceController.js';
import { createUnitRoute, deleteUnitRoute, getUnitRoute, getUnitsRoute } from './controllers/unitController.js';
import { getDataPointsRoute, getDataPointRoute, deleteDataPointRoute, createDataPointRoute } from './controllers/dataPointController.js';

export function initializeApiServer() {
    const app = express();
    app.use(express.json());

    // Routes
    app.get     ('/api/v1/devices', getDevicesRoute);
    app.get     ('/api/v1/devices/:id', getDeviceRoute);
    app.post    ('/api/v1/devices', createDeviceRoute);
    app.delete  ('/api/v1/devices/:id', deleteDeviceRoute);
    
    app.get     ('/api/v1/devices/:id/units', getUnitsRoute);
    app.get     ('/api/v1/devices/:id/units/:unitId', getUnitRoute);
    app.post    ('/api/v1/devices/:id/units', createUnitRoute);
    app.delete  ('/api/v1/devices/:id/units/:unitId', deleteUnitRoute);

    app.get     ('/api/v1/devices/:id/units/:unitId/dataPoints', getDataPointsRoute);
    app.get     ('/api/v1/devices/:id/units/:unitId/dataPoints/:dataPointId', getDataPointRoute);
    app.post    ('/api/v1/devices/:id/units/:unitId/dataPoints', createDataPointRoute);
    app.delete  ('/api/v1/devices/:id/units/:unitId/dataPoints/:dataPointId', deleteDataPointRoute);

    const port = 3000;
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

