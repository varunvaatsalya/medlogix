const requirementSchema = new mongoose.Schema({
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
  requiredQuantity: { type: Number, required: true }, // 500
  requirementRaisedOn: { type: Date, required: true }, // 2025-03-19
  requiredForMonth: { type: String, required: true }, // April 2025
  status: {
    type: String,
    enum: ["Pending", "Fulfilled", "Partial"],
    default: "Pending",
  }, // Pending
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
