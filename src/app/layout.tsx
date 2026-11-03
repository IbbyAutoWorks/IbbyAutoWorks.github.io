import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/next";
import { CloudSyncBridge } from "@/components/cloud-sync-bridge";
import { RouteBurnoutLoader } from "@/components/route-burnout-loader";
import { ThemeBoot } from "@/components/theme-boot";
import "./styles.css";

export const metadata: Metadata = {
  title: "Ibby Auto Works™",
  description: "Mobile auto repair customer portal and admin dashboard for Ibby Auto Works™.",
  manifest: "/manifest.webmanifest",
  icons: { apple: "/icons/apple-touch-icon.png" },
  appleWebApp: { capable: true, title: "Ibby Auto", statusBarStyle: "default" }
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#b7192a"
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
