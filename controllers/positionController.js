const { Position } = require('../models/position');

const createPosition = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Create Position';

  if (!req.body.ownerId) {
    res.locals.responseData = {
      status: 'error',
      message: "OwnerId field is required",
    };
    return res.status(400).json(res.locals.responseData);
  }

  try {
    const position = new Position({ ...req.body }); // Store all fields dynamically

    const newPosition = await position.save();

    res.locals.feedData = {
      tenantId: req.body.tenantId,
      feedType: 'info',
      action: {
        name: 'position_created',
        description: `Position was created`,
      },
      ownerId: req.body.ownerId,
      parentId: newPosition._id,
      parentObject: 'Position',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      message: `Position was created successfully`,
    };

    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create Position',
      requestBody: req.body,
      status: 'success',
      message: 'Position created successfully',
      responseBody: newPosition,
    };

    res.status(201).json({
      status: 'success',
      message: 'Position created successfully',
      data: newPosition,
    });
  } catch (error) {
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create Position',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};


const updatePosition = async (req, res) => {
  // Mark that logging will be handled by the controller
  res.locals.loggedByController = true;
  res.locals.processName = 'Update Position';

  const positionId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;

  try {
    // Fetch current position details
    const currentPosition = await Position.findById(positionId).lean();

    if (!currentPosition) {
      return res.status(404).json({ message: "Position not found" });
    }

    // Compare current values with updateFields to identify changes
    const changes = Object.entries(updateFields)
      .filter(([key, newValue]) => {
        const oldValue = currentPosition[key];

        console.log("Old Value:", oldValue);
        console.log("New Value:", newValue);


        // Handle arrays (e.g., `skills`) by comparing stringified versions
        if (Array.isArray(oldValue) && Array.isArray(newValue)) {
          const normalizeArray = (array) =>
            array.map(({ _id, ...rest }) => rest)
              .sort((a, b) => (a.skill || "").localeCompare(b.skill || ""));

          return JSON.stringify(normalizeArray(oldValue)) !== JSON.stringify(normalizeArray(newValue));
        }

        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: currentPosition[key],
        newValue,
      }));

    // If no changes detected, return early
    if (changes.length === 0) {
      return res.status(200).json({
        status: 'no_changes',
        message: 'No changes detected, position details remain the same',
      });
    }

    // Update the position
    const updatedPosition = await Position.findByIdAndUpdate(
      positionId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedPosition) {
      return res.status(404).json({ message: "Position not found." });
    }

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'update',
      action: {
        name: 'position_updated',
        description: `Position was updated`,
      },
      ownerId,
      parentId: positionId,
      parentObject: 'Position',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      fieldMessage: changes.map(({ fieldName, oldValue, newValue }) => ({
        fieldName,
        message: `${fieldName} updated from '${oldValue}' to '${newValue}'`,
      })),
      history: changes,
    };

    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update Position',
      requestBody: req.body,
      status: 'success',
      message: 'Position updated successfully',
      responseBody: updatedPosition,
    };

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'Position updated successfully',
      data: updatedPosition,
    });
  } catch (error) {
    // Handle errors
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update Position',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
};

// const updateRounds = async (req, res) => {
//   const { positionId } = req.params;
//   const { rounds } = req.body;

//   try {
//     const updatedPosition = await Position.findByIdAndUpdate(
//       positionId,
//       { $set: { rounds } },
//       { new: true }
//     );

//     if (!updatedPosition) {
//       return res.status(404).json({ message: "Position not found" });
//     }

//     res.status(200).json(updatedPosition);
//   } catch (error) {
//     console.error("Error updating rounds:", error);
//     res.status(500).json({ message: "error updating the rounds (position controller)" });
//   }
// };

module.exports = {
  createPosition,
  updatePosition,
  // updateRounds
};
