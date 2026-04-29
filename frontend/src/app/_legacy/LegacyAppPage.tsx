"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const ApiParkApp = dynamic(() => import("@/core/src/App"), {
  ssr: false,
  loading: () => <div style={{ padding: 50 }}>Loading APIPark...</div>
});

export default function LegacyAppPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ApiParkApp />;
}
