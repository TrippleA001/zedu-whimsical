import type { Metadata } from "next";
import StudioApp from "~/components/studio-app";

export const metadata: Metadata = {
  title: "Studio — Zedu",
  description:
    "Channels, doodles, presence orbs and a Buzz room. Everything is local, everything is playable.",
};

export default function StudioPage() {
  return <StudioApp />;
}
