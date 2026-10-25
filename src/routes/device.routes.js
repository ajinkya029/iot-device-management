const router = require("express").Router();
const Device = require("../models/Device");
const asyncHandler = require("../utils/asyncHandler");
const { requireAuth } = require("../middleware/auth.middleware");
const createDeviceKey = require("../utils/crypto");

router.use(requireAuth);

router.post("/", asyncHandler(async (req, res) => {
  const { name, type, location, metadata } = req.body || {};
  if (!name || typeof name !== "string" || !name.trim()) return res.status(400).json({ message: "Device name is required" });
  const device = await Device.create({
    owner: req.user._id, name: name.trim(), type, location, metadata,
    deviceKey: createDeviceKey(), status: "offline"
  });
  const result = device.toObject();
  delete result.deviceKey;
  res.status(201).json({ device: result, deviceKey: device.deviceKey || undefined, note: "Store the device key securely; it is only shown at creation in production deployments." });
}));

router.get("/", asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = { owner: req.user._id };
  if (req.query.status && ["online", "offline", "maintenance"].includes(req.query.status)) filter.status = req.query.status;
  if (req.query.search) filter.name = { $regex: String(req.query.search).slice(0, 80).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const [items, total] = await Promise.all([
    Device.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
    Device.countDocuments(filter)
  ]);
  res.json({ devices: items, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
}));

router.get("/:deviceId", asyncHandler(async (req, res) => {
  const device = await Device.findOne({ _id: req.params.deviceId, owner: req.user._id });
  if (!device) return res.status(404).json({ message: "Device not found" });
  res.json({ device });
}));

router.patch("/:deviceId", asyncHandler(async (req, res) => {
  const allowed = ["name", "type", "location", "status", "metadata"];
  const update = {};
  for (const key of allowed) if (req.body && Object.prototype.hasOwnProperty.call(req.body, key)) update[key] = req.body[key];
  if (update.status && !["online", "offline", "maintenance"].includes(update.status)) return res.status(400).json({ message: "Invalid status" });
  const device = await Device.findOneAndUpdate({ _id: req.params.deviceId, owner: req.user._id }, { $set: update }, { new: true, runValidators: true });
  if (!device) return res.status(404).json({ message: "Device not found" });
  res.json({ device });
}));

router.delete("/:deviceId", asyncHandler(async (req, res) => {
  const device = await Device.findOneAndDelete({ _id: req.params.deviceId, owner: req.user._id });
  if (!device) return res.status(404).json({ message: "Device not found" });
  res.json({ message: "Device deleted" });
}));

module.exports = router;
