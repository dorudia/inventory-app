import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Inventory from "@/models/Inventory";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Get or create Main Inventory
    let mainInventory = await Inventory.findOne({ userId, isDefault: true });

    if (!mainInventory) {
      mainInventory = await Inventory.create({
        userId,
        name: "Main Inventory",
        description: "Default inventory",
        isDefault: true,
      });
    }

    // Check if products already exist for this inventory
    const existingProducts = await Product.countDocuments({
      userId,
      inventoryId: mainInventory._id,
    });

    if (existingProducts > 0) {
      return NextResponse.json({
        message: "Products already seeded",
        count: existingProducts,
      });
    }

    // Seed 25 different products with varied creation dates (last 12 weeks = 84 days)
    const now = new Date();
    const products = [
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Laptop Dell XPS 15",
        price: 1899.99,
        quantity: 25,
        lowStockAt: 5,
        createdAt: new Date(now.getTime() - 80 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Mouse Logitech MX Master",
        price: 99.99,
        quantity: 150,
        lowStockAt: 20,
        createdAt: new Date(now.getTime() - 75 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Keyboard Mechanical RGB",
        price: 149.99,
        quantity: 8,
        lowStockAt: 10,
        createdAt: new Date(now.getTime() - 70 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: 'Monitor 27" 4K',
        price: 499.99,
        quantity: 12,
        lowStockAt: 3,
        createdAt: new Date(now.getTime() - 65 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "USB-C Cable 2m",
        price: 19.99,
        quantity: 200,
        lowStockAt: 50,
        createdAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Webcam HD 1080p",
        price: 79.99,
        quantity: 45,
        lowStockAt: 10,
        createdAt: new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Headphones Sony WH-1000XM5",
        price: 399.99,
        quantity: 30,
        lowStockAt: 8,
        createdAt: new Date(now.getTime() - 52 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "SSD Samsung 1TB",
        price: 129.99,
        quantity: 60,
        lowStockAt: 15,
        createdAt: new Date(now.getTime() - 48 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "RAM DDR5 32GB",
        price: 189.99,
        quantity: 18,
        lowStockAt: 5,
        createdAt: new Date(now.getTime() - 44 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Graphics Card RTX 4070",
        price: 599.99,
        quantity: 0,
        lowStockAt: 2,
        createdAt: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Power Supply 750W",
        price: 119.99,
        quantity: 22,
        lowStockAt: 5,
        createdAt: new Date(now.getTime() - 36 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Cooling Fan RGB",
        price: 39.99,
        quantity: 95,
        lowStockAt: 20,
        createdAt: new Date(now.getTime() - 32 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "MacBook Pro M3",
        price: 2499.99,
        quantity: 15,
        lowStockAt: 3,
        createdAt: new Date(now.getTime() - 28 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: 'iPad Air 11"',
        price: 799.99,
        quantity: 0,
        lowStockAt: 5,
        createdAt: new Date(now.getTime() - 24 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "AirPods Pro 2",
        price: 249.99,
        quantity: 75,
        lowStockAt: 15,
        createdAt: new Date(now.getTime() - 21 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Magic Mouse",
        price: 79.99,
        quantity: 4,
        lowStockAt: 10,
        createdAt: new Date(now.getTime() - 18 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Thunderbolt Cable",
        price: 39.99,
        quantity: 120,
        lowStockAt: 30,
        createdAt: new Date(now.getTime() - 16 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "External SSD 2TB",
        price: 249.99,
        quantity: 35,
        lowStockAt: 8,
        createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Wireless Charger",
        price: 49.99,
        quantity: 88,
        lowStockAt: 20,
        createdAt: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Laptop Stand Aluminum",
        price: 59.99,
        quantity: 42,
        lowStockAt: 10,
        createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "USB Hub 7-Port",
        price: 34.99,
        quantity: 3,
        lowStockAt: 15,
        createdAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Blue Yeti Microphone",
        price: 129.99,
        quantity: 16,
        lowStockAt: 5,
        createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Ring Light",
        price: 45.99,
        quantity: 52,
        lowStockAt: 12,
        createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Desk Mat XXL",
        price: 29.99,
        quantity: 0,
        lowStockAt: 10,
        createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        userId,
        inventoryId: mainInventory._id,
        name: "Ergonomic Chair",
        price: 349.99,
        quantity: 8,
        lowStockAt: 3,
        createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000),
      },
    ];

    const createdProducts = await Product.insertMany(products);

    return NextResponse.json({
      message: "Products seeded successfully",
      count: createdProducts.length,
      products: createdProducts,
    });
  } catch (error) {
    console.error("Error seeding products:", error);
    return NextResponse.json(
      { error: "Failed to seed products" },
      { status: 500 }
    );
  }
}
