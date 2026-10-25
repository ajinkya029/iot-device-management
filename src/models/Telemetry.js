const mongoose = require("mongoose");

const telemetrySchema = new mongoose.Schema({
  device: { type: mongoose.Schema.Types.ObjectId, ref: "Device", required: true, index: true },
  recordedAt: { type: Date, default: Date.now, index: true },
  values: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });
telemetrySchema.index({ device: 1, recordedAt: -1 });
module.exports = mongoose.model("Telemetry", telemetrySchema);
