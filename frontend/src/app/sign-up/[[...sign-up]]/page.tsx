import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 via-white to-pink-50">
      <SignUp
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-xl border rounded-2xl",
            headerTitle: "text-2xl font-bold",
            headerSubtitle: "text-gray-500",
            formButtonPrimary:
              "bg-rose-600 hover:bg-rose-700 text-white rounded-lg",
            footerActionLink: "text-rose-600 hover:text-rose-700",
          },
        }}
      />
    </div>
  );
}
