import { connectDB } from "@/lib/db";
import Inventory from "@/models/Inventory";
import Product from "@/models/Product";
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

    const user = await currentUser();
    const userEmail = user?.emailAddresses?.[0]?.emailAddress;

    const { id } = await params;
    await connectDB();

    const body = await request.json();
    const { name, description, allowedEmails } = body;

    // Find inventory where user is owner OR has email access
    const inventory = await Inventory.findOne({
      _id: id,
      $or: [{ userId }, { allowedEmails: userEmail }],
    });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    // Only owner can update name, description, and allowedEmails
    if (inventory.userId === userId) {
      if (name) inventory.name = name;
      if (description !== undefined) inventory.description = description;
      if (allowedEmails !== undefined) inventory.allowedEmails = allowedEmails;
    } else {
      return NextResponse.json(
        { error: "Only the owner can modify inventory settings" },
        { status: 403 }
      );
    }

    await inventory.save();

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("Error updating inventory:", error);
    return NextResponse.json(
      { error: "Failed to update inventory" },
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

    // Only owner can delete inventory
    const inventory = await Inventory.findOne({ _id: id, userId });

    if (!inventory) {
      return NextResponse.json(
        { error: "Inventory not found" },
        { status: 404 }
      );
    }

    // Don't allow deleting if it's the only inventory
    const inventoryCount = await Inventory.countDocuments({ userId });
    if (inventoryCount <= 1) {
      return NextResponse.json(
        { error: "Cannot delete your only inventory" },
        { status: 400 }
      );
    }

    // Delete all products in this inventory
    await Product.deleteMany({ inventoryId: id, userId });

    // Delete the inventory
    await Inventory.findByIdAndDelete(id);

    return NextResponse.json({ message: "Inventory deleted successfully" });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    return NextResponse.json(
      { error: "Failed to delete inventory" },
      { status: 500 }
    );
  }
}
