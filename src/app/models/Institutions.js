const InstitutionSchema = new mongoose.Schema({
  institutionCode: { type: String, required: true }, // INST001
  name: { type: String, required: true }, // Lucknow District Hospital
  registrationNumber: { type: String, required: true }, // UPHOSPI-2024-111
  location: {
    address: { type: String, required: true }, // Near XYZ Chowk
    city: { type: String, required: true }, // Lucknow
    district: { type: String, required: true }, // Lucknow
    state: { type: String, required: true }, // UP
    pincode: { type: String, required: true }, // 226003
    gpsCoordinates: {
      lat: { type: Number, required: false }, // 26.8500
      lng: { type: Number, required: false }, // 80.9500
    },
  },
  incharge: [
    {
      name: { type: String, required: true }, // Dr. Alok Verma
      contact: { type: String, required: true }, // 9876543211
      email: { type: String, required: false }, // alok.verma@uphospital.in
    },
  ],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Institution ||
  mongoose.model("Institution", InstitutionSchema);
