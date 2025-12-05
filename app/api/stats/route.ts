import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Inventory from "@/models/Inventory";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const inventoryId = searchParams.get("inventoryId");

    if (!inventoryId) {
      return NextResponse.json(
        { error: "Inventory ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if user has access to this inventory
    const user = await currentUser();
    const userEmails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

    const inventory = await Inventory.findOne({
      _id: inventoryId,
      $or: [{ userId }, { allowedEmails: { $in: userEmails } }],
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found or access denied" },
        { status: 403 }
      );
    }

    const products = await Product.find({ inventoryId });

    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const lowStockCount = products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.lowStockAt
    ).length;
    const outOfStockCount = products.filter((p) => p.quantity === 0).length;

    return NextResponse.json({
      totalProducts,
      totalValue,
      lowStockCount,
      outOfStockCount,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
