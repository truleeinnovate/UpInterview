

const express = require('express')
const router = express.Router()
const { createList, getList, updateList } = require('../controllers/TenentQuestionsListNamesController.js')
const loggingService = require('../middleware/loggingService.js');

router.post('/lists',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware,createList)

router.get('/lists/:userId',getList)

router.patch('/lists/:id',loggingService.internalLoggingMiddleware,loggingService.FeedsMiddleware,updateList)

module.exports = router