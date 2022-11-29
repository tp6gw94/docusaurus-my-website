import sdk, { EmbedOptions } from "@stackblitz/sdk";
import React, { useEffect, useRef } from "react";

export default function StackBlitz({
  id,
  options,
}: {
  id: string;
  options?: EmbedOptions;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!containerRef.current) return;
    sdk.embedProjectId(containerRef.current, id, {
      height: 500,
      hideExplorer: true,
      hideNavigation: true,
      ...options,
    });
  }, []);
  return (
    <div className="margin-top--md margin-bottom--md" ref={containerRef} />
  );
}
