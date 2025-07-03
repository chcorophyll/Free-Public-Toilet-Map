// src/models/toilet.model.js
const mongoose = require('mongoose');

const toiletSchema = new mongoose.Schema({
  sourceId: { type: String, unique: true },
  name: { type: String, required: true },
  address: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    }
  },
  properties: {
    isOpen24h: { type: Boolean, default: false },
    isAccessible: { type: Boolean, default: false },
    hasBabyCare: { type: Boolean, default: false },
  },
  openingHours: String,
  status: {
    type: String,
    enum: ["OPERATIONAL", "CLOSED_TEMP", "REMOVED"],
    default: "OPERATIONAL"
  }
}, { timestamps: true }); // timestamps会自动添加 createdAt 和 updatedAt

// 创建地理空间索引，这是实现“附近”查询的关键！
toiletSchema.index({ location: '2dsphere' });

const Toilet = mongoose.model('Toilet', toiletSchema);
module.exports = Toilet;