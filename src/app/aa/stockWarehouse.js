const warehouseStockSchema = new mongoose.Schema({
  warehouseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Warehouse",
    required: true,
  }, // ref to warehouse
  medicineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Medicine",
    required: true,
  }, // ref to medicine
  stocks: [
    {
      batchNumber: { type: String, required: true }, // BATCH12345
      quantity: { type: Number, required: true }, // 5000
      expiryDate: { type: Date, required: true }, // 2026-05-01
    },
  ],
  receivedDate: { type: Date, required: true }, // 2025-02-10
  supplier: { type: String, required: false }, // Mfg GSK Distributor XYZ
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
