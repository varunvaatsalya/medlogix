const MedicineSchema = new mongoose.Schema({
  name: { type: String, unique: true, required: true }, // Paracetamol
  salts: { type: mongoose.Schema.Types.ObjectId, ref: "Salt", required: true }, // ref to salt
  manufacturer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Manufacturer",
    required: true,
  }, // GSK Pharma
  isTablets: { type: Boolean, required: true }, // true/false
  medicineType: { type: String, required: false }, // Tablet, Syrup, etc.
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Medicine ||
  mongoose.model("Medicine", MedicineSchema);
