"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function RoleSelectionPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6">
      {/* Header Section */}
      <div className="text-center space-y-6 mb-16">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#1e293b] leading-tight tracking-tight">
          Select your role to begin <br />
          <span className="text-[#f59e0b]">your journey.</span>
        </h1>
        <p className="text-lg md:text-xl text-slate-600 font-medium">
          Solace tailors your experience based on who you are
        </p>
      </div>

      {/* Role Cards Container */}
      <div className="grid md:grid-cols-2 gap-10 max-w-5xl w-full px-4">
        
        {/* Client Card */}
        <Link href="/register?role=client" className="group">
          <div className="space-y-6 text-center">
            <Card className="relative aspect-[4/3] overflow-hidden border-[6px] border-transparent group-hover:border-[#22c55e] transition-all duration-300 rounded-[2.5rem] bg-[#1e293b] shadow-2xl">
              <Image
                src="/client.png"
                alt="Client Role"
                fill
                className="object-cover opacity-90 transition-transform duration-700 group-hover:scale-110"
                priority
              />
            </Card>
            <h3 className="text-3xl font-bold text-[#1e293b] tracking-wide">Client</h3>
          </div>
        </Link>

        {/* Creative Card */}
        <Link href="/register?role=creative" className="group">
          <div className="space-y-6 text-center">
            <Card className="relative aspect-[4/3] overflow-hidden border-[6px] border-transparent group-hover:border-[#f59e0b] transition-all duration-300 rounded-[2.5rem] bg-[#f59e0b] shadow-2xl">
              <Image
                src="/creative.png"
                alt="Creative Role"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
                priority
              />
            </Card>
            <h3 className="text-3xl font-bold text-[#1e293b] tracking-wide">Creative</h3>
          </div>
        </Link>

      </div>
    </div>
  );
}