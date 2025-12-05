import mongoose from "mongoose";

const UserSettingsSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    currency: {
      type: String,
      enum: ["$", "€", "£", "¥"],
      default: "$",
    },
    dateFormat: {
      type: String,
      enum: ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"],
      default: "MM/DD/YYYY",
    },
    chartType: {
      type: String,
      enum: ["bar", "area"],
      default: "bar",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.UserSettings ||
  mongoose.model("UserSettings", UserSettingsSchema);
