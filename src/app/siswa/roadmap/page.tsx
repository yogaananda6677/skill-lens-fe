import { Suspense } from "react";
import RoadmapClient from "./RoadmapClient";

export default function RoadmapPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f2f5fb]" />}>
      <RoadmapClient />
    </Suspense>
  );
}
