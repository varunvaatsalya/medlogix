const institutionStockSchema = new mongoose.Schema({
  institutionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Institution",
    required: true,
  }, // ref to institution
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

  batchName: {
    type: String,
    default: "N/A",
    required: true, // BATCH12345
  },
  expiryDate: {
    type: Date,
    required: true,
  },
  packetSize: {
    strips: {
      type: Number,
    },
    tabletsPerStrip: {
      type: Number,
    },
  },
  quantity: {
    boxes: {
      type: Number,
      required: true,
    },
    extra: {
      type: Number,
      default: 0,
    }, // extra -> strips / qty
    tablets: {
      type: Number,
      default: 0,
    },
    totalStrips: {
      type: Number,
      required: true,
    },
  },
  quantityReceived: {
    boxes: {
      type: Number,
      required: true,
    },
    totalStrips: {
      type: Number,
      required: true,
    },
  },
  purchasePrice: {
    type: Number,
    required: true,
  },
  sellingPrice: {
    type: Number,
    required: true,
  },

  expiryDate: { type: Date, required: true }, // 2026-05-01
  receivedDate: { type: Date, required: true }, // 2025-02-15
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
