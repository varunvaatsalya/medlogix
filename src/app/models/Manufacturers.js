const ManufacturerSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  address: {
    type: String,
  },
  medicalRepresentator: {
    name: {
      type: String,
    },
    contact: {
      type: Number,
    },
  },
  createdAt: { type: Date, default: Date.now, required: true },
});

export default mongoose.models.Manufacturer ||
  mongoose.model("Manufacturer", ManufacturerSchema);
