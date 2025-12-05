import Link from "next/link";
import { redirect } from "next/navigation";
import { SignOutButton, SignedIn, SignedOut } from "@clerk/nextjs";

export default async function Home() {
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Inventory Management
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage multiple inventories, track stock levels, and collaborate with your team.
            Real-time analytics, customizable currency, and seamless sharing.
          </p>
          <div className="flex gap-4 justify-center">
            <SignedOut>
              <Link
                href="/sign-in"
                className="flex items-center justify-center bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors cursor-pointer"
              >
                Sign In
              </Link>
            </SignedOut>
            <SignedIn>
              <SignOutButton>
                <button className="flex items-center justify-center bg-slate-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-slate-900 transition-colors cursor-pointer">
                  Sign Out
                </button>
              </SignOutButton>
            </SignedIn>
            <Link
              href="#"
              className="bg-white text-slate-700 px-8 py-3 rounded-lg font-semibold border-2 border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
