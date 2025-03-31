const mongoose = require("mongoose");

const RequirementHistorySchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  }, // Institution requesting the stock

  medicines: [
    {
      medicineId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      },
      quantityRequested: { type: Number, required: true }, // Total strips required
    },
  ],

  status: {
    type: String,
    enum: ["Pending", "Fulfilled", "Partial"],
    default: "Pending",
  }, // Request status

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports =
  mongoose.models.RequirementHistory ||
  mongoose.model("RequirementHistory", RequirementHistorySchema);
