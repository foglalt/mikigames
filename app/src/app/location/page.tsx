import { Suspense } from "react";
import LocationClient from "./LocationClient";

export default function LocationPage() {
  return (
    <Suspense fallback={<div className="py-5 text-center">Loading...</div>}>
      <LocationClient />
    </Suspense>
  );
}
