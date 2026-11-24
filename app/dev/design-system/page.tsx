import type { Metadata } from "next";
import { DesignSystemShowcase } from "@/features/dev/DesignSystemShowcase";

export const metadata: Metadata = {
  title: "Design System Preview",
  robots: {
    index: false,
    follow: false,
  },
};

export default function DevDesignSystemPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-canvas)]">
      <DesignSystemShowcase />
    </div>
  );
}
