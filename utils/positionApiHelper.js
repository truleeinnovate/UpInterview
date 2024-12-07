const saveIntegrationLog = require('./integrationLogs');
const ConnectedApp = require('../models/ConnectedApp1.js');
const Position = require('../models/position.js');
const { validateForm, validatePositionForm } = require('./positionValidation');

const authenticateRequest = async (clientId, accessToken) => {
    const connectedApp = await ConnectedApp.findOne({ clientId, accessToken });
    if (!connectedApp) {
        throw new Error('Invalid client credentials or access token.');
    }
    return connectedApp;
};

const validateData = (data, requiredFields) => {
    for (const field of requiredFields) {
        if (!data[field]) {
            throw new Error(`Missing required field: ${field}`);
        }
    }
};

const createEntity = async (Model, data, createdBy) => {
    const newEntity = new Model({ ...data, createdBy });
    const savedEntity = await newEntity.save();
    return savedEntity;
};

const handleRequest = async (req, res, Model, requiredFields) => {
    const { clientid: clientId } = req.headers;
    const authHeader = req.headers['authorization'];
    const accessToken = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    let logData = {
        endpoint: req.originalUrl,
        requestBody: req.body,
        responseStatus: null,
        responseBody: null,
        message: ''
    };

    try {
        const connectedApp = await authenticateRequest(clientId, accessToken);

        // Validate position form data
        const { formIsValid, newErrors } = validatePositionForm(req.body, req.body.skills || [], req.body.rounds || []);
        if (!formIsValid) {
            return res.status(400).json({ status: 'error', errors: newErrors });
        }

        // Use userId from the request body instead of clientId
        const dataWithOrgId = { ...req.body, CreatedBy: req.body.userId };
        const savedEntity = await createEntity(Model, dataWithOrgId, req.body.userId);

        const successMessage = `${Model.modelName} created successfully.`;
        const { skills, ...filteredEntity } = savedEntity.toObject();
        logData.responseStatus = 201;
        logData.responseBody = filteredEntity;
        logData.message = successMessage;

        return res.status(201).json({
            status: 'success',
            message: successMessage,
            entity: {
                id: savedEntity._id,
                referenceId: savedEntity._id
            }
        });
    } catch (error) {
        console.error('Error processing request:', error);
        logData.responseStatus = logData.responseStatus || 500;
        logData.message = logData.message || error.message;
        return res.status(logData.responseStatus).json({
            status: 'error',
            errorCode: logData.responseStatus === 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR',
            message: logData.message
        });
    } finally {
        await saveIntegrationLog(logData.endpoint, logData.requestBody, logData.responseStatus, logData.responseBody, logData.message);
    }
};

const getPositionByRef = async (req, res) => {
    const { referenceId } = req.query;

    try {
        const position = await Position.findById(referenceId);
        if (!position) {
            return res.status(404).json({ message: 'Position not found for the given referenceId.' });
        }
        res.status(200).json(position);
    } catch (error) {
        console.error('Error fetching position:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updatePositionByRef = async (req, res) => {
    const { referenceId } = req.query;
    const updateData = req.body;

    try {
        const updatedPosition = await Position.findByIdAndUpdate(referenceId, updateData, { new: true });

        if (!updatedPosition) {
            return res.status(404).json({ message: 'Position not found for the given referenceId.' });
        }

        res.status(200).json(updatedPosition);
    } catch (error) {
        console.error('Error updating position:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    handleRequest,
    getPositionByRef,
    updatePositionByRef
};