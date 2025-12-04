import React from "react";
import { FlickeringGrid } from "@/components/ui/decor/flickering-grid";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="light min-h-screen grid grid-cols-1 lg:grid-cols-5">
      <div className="hidden lg:block lg:col-span-2">
        <AuthScreenDescription />
      </div>
      <div className="flex items-center justify-center p-8 bg-white text-black lg:col-span-3">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}

function AuthScreenDescription() {
  return (
    <div className="flex flex-1 items-center justify-center h-full p-0 sm:p-6 md:p-2 pr-0! bg-white">
      {/* Black Card */}
      <div className="w-full h-full bg-black rounded-3xl md:rounded-4xl p-10 md:p-16 flex flex-col relative overflow-hidden">
        {/* Flickering Grid Background */}
        <FlickeringGrid
          className="absolute inset-0 z-0 [mask-image:radial-gradient(420px_circle_at_center,white,rgba(255,255,255,0.3)_60%,transparent)]"
          squareSize={4}
          gridGap={6}
          flickerChance={0.1}
          color="rgb(134, 173, 255)"
          maxOpacity={0.3}
        />

        {/* Minimal Copy (bottom left aligned) */}
        <div className="flex flex-1 items-end justify-start relative z-10">
          <div className="max-w-lg space-y-8 text-left">
            {/* Headline */}
            <h1 className="text-white text-lg md:text-xl font-semibold tracking-tight leading-tight">
              Build Your Perfect CV.
            </h1>

            {/* Subheading */}
            <p className="text-gray-300 text-md md:text-lg leading-relaxed">
              Create professional, ATS-friendly resumes with AI-powered
              optimization and beautiful templates tailored to your career.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
