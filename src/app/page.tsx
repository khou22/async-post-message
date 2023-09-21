"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Textarea } from "@/components/ui/textarea";
import { PAGES } from "@/utils/pages";
import moment from "moment";
import { useRef, useState } from "react";

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [textValue, setTextValue] = useState(
    `The page loaded at ${moment().format("lll")}`
  );

  const postMessageToIFrame = (message: any) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(message, "*");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 gap-y-8 max-w-4xl m-auto">
      <h1 className="text-4xl font-bold">Promise Post Message</h1>
      <p>
        Enter some text and click the &quot;Get Data&quot; button in the Web
        View iFrame. The Web View will fetch the data from the parent window.
      </p>
      <Textarea
        placeholder="Enter some text"
        value={textValue}
        onChange={(e) => setTextValue(e.target.value)}
        className="w-full h-24 resize-none"
      />

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
