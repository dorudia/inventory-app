import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Inventory from "@/models/Inventory";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { name, price, quantity, lowStockAt } = body;

    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user has access to this inventory
    const user = await currentUser();
    const userEmails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

    const inventory = await Inventory.findOne({
      _id: product.inventoryId,
      $or: [{ userId }, { allowedEmails: { $in: userEmails } }],
    });

    if (!inventory) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    product.name = name;
    product.price = price;
    product.quantity = quantity;
    product.lowStockAt = lowStockAt;
    await product.save();

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error updating product:", error);
    return NextResponse.json(
      { error: "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user has access to this inventory
    const user = await currentUser();
    const userEmails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

    const inventory = await Inventory.findOne({
      _id: product.inventoryId,
      $or: [{ userId }, { allowedEmails: { $in: userEmails } }],
    });

    if (!inventory) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await connectDB();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check if user has access to this inventory
    const user = await currentUser();
    const userEmails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

    const inventory = await Inventory.findOne({
      _id: product.inventoryId,
      $or: [{ userId }, { allowedEmails: { $in: userEmails } }],
    });

    if (!inventory) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}
