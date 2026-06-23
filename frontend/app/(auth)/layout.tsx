import { ReactNode } from 'react';

/**
 * Centered auth layout for login, register, and password reset
 * Professional-grade authentication UI with consistent styling
 */
export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-[#1B2A4A] via-[#1f2d5c] to-[#0f1929]">
      {/* Background decorative elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-3xl font-bold tracking-tight text-white mb-1">
            Kenya<span className="text-teal-400">Finance</span>
          </div>
          <p className="text-gray-400 text-xs uppercase tracking-widest font-medium">
            Financial Management Made Simple
          </p>
          <p className="text-gray-500 text-xs mt-1">
            Maisha ni kupanga, anza leo.
          </p>
        </div>

        {/* Main content */}
        {children}

        {/* Footer */}
        <div className="mt-8 text-center text-gray-500 text-xs">
          <p>&copy; {new Date().getFullYear()} KeshoKwako. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
