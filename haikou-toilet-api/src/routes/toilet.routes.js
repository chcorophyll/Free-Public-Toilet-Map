// src/routes/toilet.routes.js
const express = require('express');
const router = express.Router();
const toiletController = require('../controllers/toilet.controller');

// GET /api/v1/toilets - 获取附近的厕所
router.get('/', toiletController.getToiletsNearMe);

// GET /api/v1/toilets/:id - 获取指定ID的厕所详情
router.get('/:id', toiletController.getToiletById);

module.exports = router;