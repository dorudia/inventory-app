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

    const products = await Product.find({ inventoryId }).sort({
      createdAt: -1,
    });

    // Key Metrics
    const totalProducts = products.length;
    const totalValue = products.reduce(
      (sum, p) => sum + p.price * p.quantity,
      0
    );
    const lowStock = products.filter(
      (p) => p.quantity > 0 && p.quantity <= p.lowStockAt
    ).length;
    const outOfStock = products.filter((p) => p.quantity === 0).length;
    const inStock = totalProducts - lowStock - outOfStock;

    // Products per week (last 12 weeks)
    const now = new Date();
    const weeklyData = [];
    for (let i = 11; i >= 0; i--) {
      const weekStart = new Date(
        now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000
      );
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      const count = products.filter((p) => {
        const created = new Date(p.createdAt);
        return created >= weekStart && created < weekEnd;
      }).length;

      const weekLabel = `W${12 - i}`;
      weeklyData.push({ week: weekLabel, products: count });
    }

    // Recent products for stock levels (5 most recent)
    const recentProducts = products.slice(0, 5).map((p) => ({
      name: p.name,
      quantity: p.quantity,
      lowStockAt: p.lowStockAt,
      status: p.quantity === 0 ? 0 : p.quantity <= p.lowStockAt ? 1 : 2,
    }));

    return NextResponse.json({
      metrics: {
        totalProducts,
        totalValue,
        lowStock,
        outOfStock,
        inStock,
      },
      weeklyData,
      recentProducts,
      efficiency: {
        inStockPercent: Math.round((inStock / totalProducts) * 100),
        lowStockPercent: Math.round((lowStock / totalProducts) * 100),
        outOfStockPercent: Math.round((outOfStock / totalProducts) * 100),
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
