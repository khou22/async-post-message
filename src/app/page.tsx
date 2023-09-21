"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import {
  AsyncPostMessageRequest,
  AsyncPostMessageResponse,
} from "@/utils/AsyncPostMessage/types";
import { PAGES } from "@/utils/pages";
import moment from "moment";
import { useEffect, useRef, useState } from "react";
import { MyPromises } from "./webview/page";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { delay } from "@/utils/delay";

type LatencyType = "none" | "low" | "medium" | "high" | "timeout";

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [textValue, setTextValue] = useState(
    `The page loaded at ${moment().format("lll")}`
  );
  const [fetchLatency, setFetchLatency] = useState<LatencyType>("none");

  const postMessageToIFrame = (
    message: AsyncPostMessageResponse<MyPromises>
  ) => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow?.postMessage(message, "*");
    }
  };

  useEffect(() => {
    const handleMessage = async (
      event: MessageEvent<AsyncPostMessageRequest<MyPromises>>
    ) => {
      switch (fetchLatency) {
        case "low":
          await delay(300);
          break;
        case "medium":
          await delay(750);
          break;
        case "high":
          await delay(2000);
          break;
        case "timeout":
          await delay(10000);
        case "none":
        default:
          break;
      }

      const { uid, functionName, args } = event.data;
      switch (functionName) {
        case "getText": {
          postMessageToIFrame({
            uid,
            functionName: "getText",
            response: textValue,
          });
          break;
        }
        case "multiplyByFour": {
          const argsTyped = args as Parameters<MyPromises["multiplyByFour"]>;
          postMessageToIFrame({
            uid,
            functionName: "multiplyByFour",
            response: 4 * argsTyped[0],
          });
          break;
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, [fetchLatency, textValue]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start p-24 gap-y-8 max-w-4xl m-auto">
      <h1 className="text-4xl font-bold">Promise Post Message</h1>
      <p>
        Enter some text and click the &quot;Get Data&quot; button in the Web
        View iFrame. The Web View will fetch the data from the parent window.
      </p>

      <div className="w-full flex flex-col gap-y-1">
        <label className="text-sm font-bold">Promise Latency (optional)</label>
        <Select
          value={fetchLatency}
          onValueChange={(v) => setFetchLatency(v as LatencyType)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select a latency" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Latency</SelectLabel>
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="timeout">Timeout</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="w-full flex flex-col gap-y-1">
        <label className="text-sm font-bold">Text Value</label>
        <Textarea
          placeholder="Enter some text"
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          className="w-full h-24 resize-none"
        />
      </div>

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

      <div className="max-w-3xl w-full flex flex-row justify-between items-center">
        <p>
          Made by{" "}
          <a
            href="https://linkedin.com/in/kevinhou22"
            className="text-blue-500 underline hover:text-blue-600"
          >
            Kevin Hou
          </a>
        </p>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="Codeium" src="https://codeium.com/badges/main" />
      </div>
    </main>
  );
}
