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

    const body = await request.json();
    const { name, price, quantity, lowStockAt, inventoryId } = body;

    if (
      !name ||
      price === undefined ||
      quantity === undefined ||
      lowStockAt === undefined ||
      !inventoryId
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    const product = await Product.create({
      userId,
      inventoryId,
      name,
      price,
      quantity,
      lowStockAt,
    });

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
