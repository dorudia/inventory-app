import mongoose from "mongoose";

const InventorySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    allowedEmails: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
InventorySchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Inventory ||
  mongoose.model("Inventory", InventorySchema);
