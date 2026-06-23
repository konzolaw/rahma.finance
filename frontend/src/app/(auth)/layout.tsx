import { ReactNode } from 'react';

/**
 * Centered auth layout for login, register, and password reset
 */
export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#1B2A4A]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">
            Kenya<span className="text-teal-500">Finance</span>
          </h1>
          <p className="text-gray-400 text-sm">
            Maisha ni kupanga, anza leo.
          </p>
        </div>
        
        <div className="bg-[#1f2d5c] border border-white/10 p-8 rounded-2xl shadow-2xl backdrop-blur-sm">
          {children}
        </div>

        <div className="text-center text-gray-500 text-xs">
          &copy; {new Date().getFullYear()} KeshoKwako. All rights reserved.
        </div>
      </div>
    </div>
  );
}
