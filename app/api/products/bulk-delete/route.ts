import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { ids } = await request.json();

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid product IDs" },
        { status: 400 }
      );
    }

    await connectDB();

    const result = await Product.deleteMany({
      _id: { $in: ids },
      userId,
    });

    return NextResponse.json({
      message: `${result.deletedCount} products deleted successfully`,
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Error bulk deleting products:", error);
    return NextResponse.json(
      { error: "Failed to delete products" },
      { status: 500 }
    );
  }
}
