const { validateEmail, validatePhoneNumber, validateCandidateForm } = require('./candidateValidation.js');
const saveIntegrationLog = require('./integrationLogs.js');
const ConnectedApp = require('../models/ConnectedApp1.js');
const Candidate = require('../models/candidate.js'); // Ensure Candidate model is imported

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

    if (data.email && !validateEmail(data.email)) {
        throw new Error('Invalid email format.');
    }

    if (data.phone && !validatePhoneNumber(data.phone)) {
        throw new Error('Phone number should contain only numbers.');
    }
};

const createEntity = async (Model, data, createdBy) => {
    const newEntity = new Model({ ...data, createdBy });
    const savedEntity = await newEntity.save();
    return savedEntity;
};

const handleRequest = async (req, res, Model, requiredFields) => {
    const { clientid: clientId, organizationid: organizationId } = req.headers;
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

        // Validate candidate form data
        const { formIsValid, newErrors } = validateCandidateForm(req.body, req.body.skills || [], req.body.Position, {});
        if (!formIsValid) {
            return res.status(400).json({ status: 'error', errors: newErrors });
        }

        // Use userId from the request body instead of clientId
        const dataWithOrgId = { ...req.body, organizationId, createdBy: req.body.userId };
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

const getCandidatesByRef = async (req, res) => {
    const { referenceId } = req.query;

    try {
        const candidates = await Candidate.find({ _id: referenceId });
        if (candidates.length === 0) {
            return res.status(404).json({ message: 'No candidates found for the given referenceId.' });
        }
        res.status(200).json(candidates);
    } catch (error) {
        console.error('Error fetching candidates:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

const updateCandidateByRef = async (req, res) => {
    const { referenceId } = req.query;
    const updateData = req.body;

    try {
        const updatedCandidate = await Candidate.findOneAndUpdate(
            { _id: referenceId },
            updateData,
            { new: true }
        );

        if (!updatedCandidate) {
            return res.status(404).json({ message: 'Candidate not found for the given referenceId.' });
        }

        res.status(200).json(updatedCandidate);
    } catch (error) {
        console.error('Error updating candidate:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    handleRequest,
    getCandidatesByRef,
    updateCandidateByRef
};