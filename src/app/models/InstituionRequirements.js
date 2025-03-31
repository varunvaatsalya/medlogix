const requirementSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  }, // ref to institution
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  }, // ref to institution
  requirements: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      }, // ref to medicine
      Quantity: { type: Number, required: true },
      allotedQuantity: { type: Number },
    },
  ],
  requirementRaisedOn: { type: Date, required: true }, // 2025-03-19
  status: {
    type: String,
    enum: ["Pending", "Fulfilled", "Partial", "Rejected"],
    default: "Pending",
  }, // Pending
  isStockDeducted: { type: Boolean, default: false }, // true / false
  stockLogistic: {
    status: {
      type: String,
      enum: ["Pending", "Fulfilled", "Partial"],
      default: "Pending",
    },
    shipmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Logistic",
    },
  },
  isRecieved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
