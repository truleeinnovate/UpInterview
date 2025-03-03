const QuestionbankFavList = require("../models/questionbankFavList");
const getList = async (req, res) => {
  const { userId } = req.params;

  try {
    const lists = await QuestionbankFavList.find({ ownerId: userId });
    res.status(200).json(lists);
  } catch (error) {
    console.error('Error fetching lists:', error);
    res.status(500).json({ error: 'Error fetching lists' });
  }
}
const createList = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Create new list';
  const { label, ownerId, tenantId, name } = req.body;

  try {
    const newList = await QuestionbankFavList.create({
      label,
      ownerId,
      tenantId,
      name,
    });
    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'info',
      action: {
        name: 'listName_created',
        description: `List name was created`,
      },
      ownerId,
      parentId: newList._id,
      parentObject: 'Tenent questions list name',
      metadata: req.body,
      severity: res.statusCode >= 500 ? 'high' : 'low',
      message: `list was created successfully`,
    };
    // Generate logs
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Create list name',
      requestBody: req.body,
      status: 'success',
      message: 'New list created successfully',
      responseBody: newList,
    };

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'New list created successfully',
    });
  } catch (error) {
    // Handle errors
    res.locals.logData = {
      tenantId: req.body.tenantId,
      ownerId: req.body.ownerId,
      processName: 'Create new list',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.locals.responseData = {
      status: 'error',
      message: error.message,
    };
  }
}




const updateList = async (req, res) => {
  res.locals.loggedByController = true;
  res.locals.processName = 'Update list';
  const listId = req.params.id;
  const { tenantId, ownerId, ...updateFields } = req.body;


  try {
    // feeds related data
    const currentlist = await QuestionbankFavList.findById(listId).lean();
    if (!currentlist) {
      return res.status(404).json({ message: "list not found" });
    }

    // Compare current values with updateFields to identify changes
    const changes = Object.entries(updateFields)
      .filter(([key, newValue]) => {
        const oldValue = currentlist[key];
        // Default comparison for strings, numbers, and other types
        return oldValue !== newValue;
      })
      .map(([key, newValue]) => ({
        fieldName: key,
        oldValue: currentlist[key],
        newValue,
      }));


    // If no changes detected, return early
    if (changes.length === 0) {
      return res.status(200).json({
        status: 'no_changes',
        message: 'No changes detected, list details remain the same',
      });
    }

    const updatedList = await QuestionbankFavList.findByIdAndUpdate(
      listId,
      updateFields,
      { new: true }
    );

    if (!updatedList) {
      return res.status(404).json({ message: 'List not found.' });
    }

    // Generate feed
    res.locals.feedData = {
      tenantId,
      feedType: 'update',
      action: {
        name: 'list_updated',
        description: `list was updated`,
      },
      ownerId,
      parentId: listId,
      parentObject: 'Tenent questions list name',
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
      processName: 'Update list name',
      requestBody: req.body,
      status: 'success',
      message: 'List updated successfully',
      responseBody: updatedList,
    };

    // Send response
    res.status(201).json({
      status: 'success',
      message: 'List updated successfully',
    });
  } catch (error) {
    // Handle errors
    res.locals.logData = {
      tenantId,
      ownerId,
      processName: 'Update list name',
      requestBody: req.body,
      message: error.message,
      status: 'error',
    };

    res.status(500).json({
      status: 'error',
      message: error.message,
    });
  }
}

module.exports = { createList, getList, updateList }