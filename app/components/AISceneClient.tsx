"use client";

import dynamic from "next/dynamic";

const AIScene = dynamic(() => import("./AIScene").then((m) => m.default), {
  ssr: false,
});

export default function AISceneClient() {
  return <AIScene />;
}
