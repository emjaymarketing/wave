import { LoginForm } from "@/components/login-form";
import Image from "next/image";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-8">
          <Image
            src="/wave-logo.png"
            alt="Wave Logo"
            width={300}
            height={100}
            priority
            className="object-contain"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
