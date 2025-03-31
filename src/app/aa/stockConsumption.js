const consumptionSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  }, // ref to institution
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  }, // ref to medicine
  quantityConsumed: { type: Number, required: true }, // 200
  consumptionDate: { type: Date, required: true }, // 2025-03-20
  remarks: { type: String, required: false }, // Used in OPD fever cases
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
