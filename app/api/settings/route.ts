import { connectDB } from "@/lib/db";
import UserSettings from "@/models/UserSettings";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    let settings = await UserSettings.findOne({ userId });

    // Create default settings if they don't exist
    if (!settings) {
      settings = await UserSettings.create({
        userId,
        currency: "$",
        dateFormat: "MM/DD/YYYY",
        chartType: "bar",
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    const body = await request.json();
    const { currency, dateFormat, chartType } = body;

    let settings = await UserSettings.findOne({ userId });

    if (!settings) {
      // Create new settings
      settings = await UserSettings.create({
        userId,
        currency: currency || "$",
        dateFormat: dateFormat || "MM/DD/YYYY",
        chartType: chartType || "bar",
      });
    } else {
      // Update existing settings
      if (currency !== undefined) settings.currency = currency;
      if (dateFormat !== undefined) settings.dateFormat = dateFormat;
      if (chartType !== undefined) settings.chartType = chartType;
      await settings.save();
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    );
  }
}
