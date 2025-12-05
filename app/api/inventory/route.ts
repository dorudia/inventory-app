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
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";
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

    let query: any = { inventoryId };

    // Search filter
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }

    // Stock status filter
    if (filter === "out-of-stock") {
      query.quantity = 0;
    } else if (filter === "low-stock") {
      query.$expr = {
        $and: [
          { $gt: ["$quantity", 0] },
          { $lte: ["$quantity", "$lowStockAt"] },
        ],
      };
    } else if (filter === "in-stock") {
      query.$expr = { $gt: ["$quantity", "$lowStockAt"] };
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
