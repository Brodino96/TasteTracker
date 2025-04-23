import { LoginForm } from "@/components/auth/LoginForm";

export function SignInPage() {
  return (
    <div className="container max-w-screen-xl mx-auto flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-8">Sign In</h1>
        <LoginForm />
      </div>
    </div>
  );
}