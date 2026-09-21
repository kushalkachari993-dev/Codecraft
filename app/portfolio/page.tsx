import type { Metadata } from "next";
import PortfolioApp from "./portfolio-app";

export const metadata: Metadata = {
  title: "Project Portfolio · CodeCraft",
  description: "Build, assess, and share evidence from CodeCraft flagship engineering projects.",
};

export default function PortfolioPage() {
  return <PortfolioApp />;
}
