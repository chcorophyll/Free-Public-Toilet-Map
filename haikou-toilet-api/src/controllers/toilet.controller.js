// src/controllers/toilet.controller.js
const Toilet = require('../models/toilet.model');

// GET /api/v1/toilets
exports.getToiletsNearMe = async (req, res) => {
  const { longitude, latitude, radius = 2000, filters } = req.query;

  if (!longitude || !latitude) {
    return res.status(400).json({ error: "Missing required parameters: longitude, latitude" });
  }

  try {
    const query = {
      location: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseInt(radius) // 半径，单位：米
        }
      }
    };
    
    // 处理筛选条件
    if (filters) {
        filters.split(',').forEach(filter => {
            if (filter.trim() !== '') {
                query[`properties.${filter.trim()}`] = true;
            }
        });
    }

    const toilets = await Toilet.find(query);
    res.status(200).json(toilets);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching toilets.", details: error.message });
  }
};

// GET /api/v1/toilets/:id
exports.getToiletById = async (req, res) => {
  try {
    const toilet = await Toilet.findById(req.params.id);
    if (!toilet) {
      return res.status(404).json({ error: "Toilet not found" });
    }
    res.status(200).json(toilet);
  } catch (error) {
    res.status(500).json({ error: "An error occurred while fetching the toilet.", details: error.message });
  }
};