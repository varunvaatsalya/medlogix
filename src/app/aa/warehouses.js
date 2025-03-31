const warehouseSchema = new mongoose.Schema({
  warehouseCode: { type: String, required: true }, // WH001
  name: { type: String, required: true }, // Lucknow Central Warehouse
  location: {
    address: { type: String, required: true }, // XYZ road, Lucknow
    city: { type: String, required: true }, // Lucknow
    district: { type: String, required: true }, // Lucknow
    state: { type: String, required: true }, // UP
    pincode: { type: String, required: true }, // 226001
    gpsCoordinates: {
      lat: { type: Number, required: false }, // 26.8467
      lng: { type: Number, required: false }, // 80.9462
    },
  },
  managers: [{
    name: { type: String, required: true }, // Ravi Shukla
    contact: { type: String, required: true }, // 9876543210
    email: { type: String, required: false }, // manager@warehouse.in
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
