const medicineSchema = new mongoose.Schema({
  saltId: { type: mongoose.Schema.Types.ObjectId, ref: "Salt", required: true }, // ref to salt
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer",
    required: true,
  }, // GSK Pharma
  isTablets: { type: Boolean, required: true }, // true/false
  strength: { type: String, required: false }, // 500mg
  packetSize: {
    strips: {
      type: Number,
      required: true, // Strip of 15
    },
    tabletsPerStrip: {
      type: Number,
      required: true, // 1 if syrup
    },
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
