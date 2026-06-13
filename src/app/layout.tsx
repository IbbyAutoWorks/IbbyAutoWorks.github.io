import type { Metadata } from "next";
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
        {children}
      </body>
    </html>
  );
}
