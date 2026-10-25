const router = require("express").Router();
const Device = require("../models/Device");
const Telemetry = require("../models/Telemetry");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth.middleware");

// Authenticated user endpoint to inspect device telemetry.
router.get("/:deviceId/telemetry", requireAuth, asyncHandler(async (req, res) => {
  const device = await Device.findOne({ _id: req.params.deviceId, owner: req.user._id });
  if (!device) return res.status(404).json({ message: "Device not found" });
  const limit = Math.min(500, Math.max(1, parseInt(req.query.limit, 10) || 100));
  const query = { device: device._id };
  if (req.query.from || req.query.to) {
    query.recordedAt = {};
    if (req.query.from && !Number.isNaN(Date.parse(req.query.from))) query.recordedAt.$gte = new Date(req.query.from);
    if (req.query.to && !Number.isNaN(Date.parse(req.query.to))) query.recordedAt.$lte = new Date(req.query.to);
  }
  const records = await Telemetry.find(query).sort({ recordedAt: -1 }).limit(limit);
  res.json({ telemetry: records, count: records.length });
}));

// Device-to-cloud ingestion using per-device key, not a user JWT.
router.post("/:deviceId/telemetry", asyncHandler(async (req, res) => {
  const device = await Device.findById(req.params.deviceId).select("+deviceKey");
  if (!device) return res.status(404).json({ message: "Device not found" });
  const key = req.header("x-device-key");
  if (!key || key !== device.deviceKey) return res.status(401).json({ message: "Valid x-device-key header required" });
  const values = req.body && req.body.values;
  if (!values || typeof values !== "object" || Array.isArray(values)) return res.status(400).json({ message: "values must be a JSON object" });
  const recordedAt = req.body.recordedAt ? new Date(req.body.recordedAt) : new Date();
  if (Number.isNaN(recordedAt.getTime())) return res.status(400).json({ message: "recordedAt must be a valid date" });
  const record = await Telemetry.create({ device: device._id, values, recordedAt });
  device.lastSeenAt = new Date();
  if (device.status !== "maintenance") device.status = "online";
  await device.save();
  res.status(201).json({ telemetry: record });
}));

module.exports = router;
