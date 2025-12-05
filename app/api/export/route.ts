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

    // Create CSV content
    const headers = [
      "Name",
      "Price",
      "Quantity",
      "Low Stock At",
      "Status",
      "Total Value",
      "Added",
    ];
    const rows = products.map((p) => {
      const status =
        p.quantity === 0
          ? "Out of Stock"
          : p.quantity <= p.lowStockAt
          ? "Low Stock"
          : "In Stock";
      const totalValue = (p.price * p.quantity).toFixed(2);
      const date = new Date(p.createdAt).toLocaleDateString();

      return [
        `"${p.name}"`,
        p.price.toFixed(2),
        p.quantity,
        p.lowStockAt,
        status,
        totalValue,
        date,
      ].join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="inventory-${
          new Date().toISOString().split("T")[0]
        }.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
