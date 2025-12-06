import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-100">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800 mb-2">
          Inventory Management
        </h1>
        <p className="text-slate-600">
          Manage multiple inventories, track stock levels, and collaborate with
          your team
        </p>
      </div>
      <SignIn />
    </div>
  );
}
