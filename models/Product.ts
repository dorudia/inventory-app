import mongoose, { Schema, models } from "mongoose";

export interface IProduct {
  userId: string;
  inventoryId: string;
  name: string;
  price: number;
  quantity: number;
  lowStockAt: number;
  createdAt?: Date;
  updatedAt?: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      index: true,
    },
    inventoryId: {
      type: String,
      required: [true, "Inventory ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
      default: 0,
    },
    lowStockAt: {
      type: Number,
      required: [true, "Low stock threshold is required"],
      min: [0, "Low stock threshold cannot be negative"],
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for faster queries
ProductSchema.index({ userId: 1, inventoryId: 1, createdAt: -1 });

const Product =
  models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
