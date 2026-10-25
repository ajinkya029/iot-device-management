const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 100 },
  deviceKey: { type: String, required: true, unique: true, select: false },
  type: { type: String, trim: true, default: "generic", maxlength: 80 },
  location: {
    label: { type: String, trim: true, maxlength: 120 },
    latitude: { type: Number, min: -90, max: 90 },
    longitude: { type: Number, min: -180, max: 180 }
  },
  status: { type: String, enum: ["online", "offline", "maintenance"], default: "offline" },
  lastSeenAt: { type: Date, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });
deviceSchema.index({ owner: 1, createdAt: -1 });
module.exports = mongoose.model("Device", deviceSchema);
