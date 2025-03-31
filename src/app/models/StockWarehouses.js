const WarehouseStockSchema = new mongoose.Schema({
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
      quantity: { type: Number, required: true }, // Total Strips
      expiryDate: { type: Date, required: true }, // 2026-05-01
      packetSize: {
        strips: { type: Number },
        tabletsPerStrip: { type: Number },
      },
      purchasePrice: { type: Number, required: true },
      sellingPrice: { type: Number, required: true },
      mrp: { type: Number, required: true },
      receivedDate: { type: Date, required: true }, // 2025-02-10
      supplier: { type: String, required: false }, // Mfg GSK Distributor XYZ
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.models.StockWarehouse ||
  mongoose.model("StockWarehouse", WarehouseStockSchema);
