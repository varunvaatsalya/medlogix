const InstitutionStockSchema = new mongoose.Schema({
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

  stocks: [
    {
      warehouseId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Warehouse",
        required: true,
      }, // ref to warehouse
      batchName: { type: String, default: "N/A", required: true }, // BATCH12345
      expiryDate: { type: Date, required: true },
      packetSize: {
        strips: { type: Number },
        tabletsPerStrip: { type: Number },
      },
      quantity: {
        boxes: { type: Number, required: true },
        extra: { type: Number, default: 0 }, // extra -> strips / qty
        tablets: { type: Number, default: 0 },
        totalStrips: { type: Number, required: true },
      },
      quantityReceived: { type: Number, required: true }, // totalStrips received

      purchasePrice: { type: Number, required: true },
      mrp: { type: Number, required: true },
      receivedDate: { type: Date, required: true }, // 2025-02-15
      createdAt: { type: Date, default: Date.now },
    },
  ],
});

export default mongoose.models.StockInstitution ||
  mongoose.model("StockInstitution", InstitutionStockSchema);
