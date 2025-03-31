const SaltSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  useCase: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now, required: true },
});


export default mongoose.models.Salt ||
  mongoose.model("Salt", SaltSchema);