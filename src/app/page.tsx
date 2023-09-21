"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Button } from "@/components/ui/button";
import { PAGES } from "@/utils/pages";
import { useRef } from "react";

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const postMessageToIFrame = (message: any) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(message, "*");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 gap-y-8">
      <h1 className="text-4xl font-bold">Promise Post Message</h1>
      <Button>Test</Button>

      <div className="max-w-2xl w-full shadow-lg">
        <AspectRatio ratio={3 / 2}>
          <iframe
            ref={iframeRef}
            src={PAGES.WEBVIEW}
            className="w-full h-full border border-black rounded"
            title="IFrame"
          />
        </AspectRatio>
      </div>
    </main>
  );
}
