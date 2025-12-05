import { connectDB } from "@/lib/db";
import Inventory from "@/models/Inventory";
import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await currentUser();
    // Get all email addresses from the user
    const userEmails = user?.emailAddresses?.map((e) => e.emailAddress) || [];

    console.log("User emails:", userEmails); // Debug log

    await connectDB();

    // Find inventories where user is owner OR any of their emails is in allowedEmails
    const inventories = await Inventory.find({
      $or: [{ userId }, { allowedEmails: { $in: userEmails } }],
    }).sort({ createdAt: -1 });

    // If no inventories exist, create a default one
    if (inventories.length === 0) {
      const defaultInventory = await Inventory.create({
        userId,
        name: "Main Inventory",
        description: "Default inventory",
        isDefault: true,
      });
      return NextResponse.json([defaultInventory]);
    }

    return NextResponse.json(inventories);
  } catch (error) {
    console.error("Error fetching inventories:", error);
    return NextResponse.json(
      { error: "Failed to fetch inventories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Inventory name is required" },
        { status: 400 }
      );
    }

    const inventory = await Inventory.create({
      userId,
      name,
      description: description || "",
      isDefault: false,
    });

    return NextResponse.json(inventory, { status: 201 });
  } catch (error) {
    console.error("Error creating inventory:", error);
    return NextResponse.json(
      { error: "Failed to create inventory" },
      { status: 500 }
    );
  }
}
