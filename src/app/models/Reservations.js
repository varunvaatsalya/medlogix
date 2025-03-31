const mongoose = require("mongoose");

const ReservationSchema = new mongoose.Schema({
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  },
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  },
  reservedQuantity: { type: Number, required: true, default: 0 }, // Kitna stock reserve ho chuka
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Reservation ||
  mongoose.model("Reservation", ReservationSchema);
