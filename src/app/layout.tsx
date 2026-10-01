import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { CloudSyncBridge } from "@/components/cloud-sync-bridge";
import { RouteBurnoutLoader } from "@/components/route-burnout-loader";
import { ThemeBoot } from "@/components/theme-boot";
import "./styles.css";

export const metadata: Metadata = {
  title: "Ibby Auto Works™",
  description: "Mobile auto repair customer portal and admin dashboard for Ibby Auto Works™."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ThemeBoot />
        <RouteBurnoutLoader />
        <CloudSyncBridge />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
