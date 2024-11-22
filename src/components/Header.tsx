import React from 'react';

export default function Header() {
  return (
    <header className="bg-[#002C51] text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-12 w-12 relative">
              <img
                src="/hilton-logo.svg"
                alt="Hilton Logo"
                className="h-full w-full object-contain"
              />
            </div>
            <div>
              <h1 className="hilton-heading text-2xl">Hilton Grand Vacations</h1>
              <p className="hilton-text text-sm mt-1 opacity-90">Sales Performance Dashboard</p>
            </div>
          </div>
          <div className="hilton-text text-sm">
            © {new Date().getFullYear()} Hilton Hotels™
          </div>
        </div>
      </div>
    </header>
  );
}