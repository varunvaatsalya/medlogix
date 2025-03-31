const mongoose = require("mongoose");

const LogisticsSchema = new mongoose.Schema({
  shipmentId: { type: String, required: true, unique: true }, // SHP12345
  warehouse: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  }, // Warehouse from which medicines are sent
  institution: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  }, // Hospital or institution receiving the medicines

  medicines: [
    {
      medicine: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Medicine",
        required: true,
      }, // Medicine ID
      quantity: { type: Number, required: true }, // 100 (Tablets/Bottles)
    },
  ],

  vehicles: [
    {
      vehicleNumber: { type: String, required: true }, // UP32 AB 1234
      driverName: { type: String, required: true }, // Rajesh Kumar
      driverContact: { type: String, required: true }, // 9876543210
      timestamps: {
        loadedAt: { type: Date, required: true }, // When medicines were loaded in vehicle
        departedAt: { type: Date, required: true }, // When vehicle left warehouse
        arrivedAt: { type: Date }, // When vehicle reached hospital (optional, update when received)
        unloadedAt: { type: Date }, // When medicines were unloaded at institution
      },
    },
  ],

  status: {
    type: String,
    enum: ["Pending", "In Transit", "Delivered"],
    default: "Pending",
  }, // Track status of shipment
});

module.exports = mongoose.model("Logistics", LogisticsSchema);
