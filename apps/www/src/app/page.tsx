"use client";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
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
import { handleWebViewRequest } from "async-post-message";
import Link from "next/link";

type LatencyType = "none" | "low" | "medium" | "high" | "timeout";

const getLatency = (latencyType: LatencyType) => {
  switch (latencyType) {
    case "low":
      return 300;
    case "medium":
      return 750;
    case "high":
      return 2000;
    case "timeout":
      return 10000;
    case "none":
    default:
      return 0;
  }
};

export default function Home() {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [textValue, setTextValue] = useState(
    `The page loaded at ${moment().format("lll")}`
  );
  const [fetchLatency, setFetchLatency] = useState<LatencyType>("low");

  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    const unsubscribe = handleWebViewRequest<MyPromises>(
      iframeRef.current.contentWindow,
      async (request) => {
        const { uid, functionName, args } = request;
        const latency = getLatency(fetchLatency);
        await delay(latency);
        switch (functionName) {
          case "getText": {
            const response = textValue;
            return {
              uid,
              functionName: "getText",
              response,
            };
          }
          case "multiplyByFour": {
            const argsTyped = args as Parameters<MyPromises["multiplyByFour"]>;
            const response = 4 * argsTyped[0];
            return {
              uid,
              functionName: "multiplyByFour",
              response,
            };
          }
          case "induceError":
            return {
              uid,
              functionName: "induceError",
              response: null,
              error: "Intentionally thrown error",
            };
        }
      }
    );

    return () => {
      unsubscribe();
    };
  }, [fetchLatency, textValue]);

  return (
    <>
      <a
        href="https://github.com/khou22/async-post-message"
        target="_blank"
        className="fixed top-4 right-4 hover:opacity-80 opacity-100 transition-opacity duration-150"
        aria-label="github repo"
      >
        <Image src="/github-mark.svg" alt="github" width={30} height={30} />
      </a>
      <main className="flex min-h-screen flex-col items-center justify-start p-16 gap-y-8 max-w-4xl m-auto">
        <h1 className="text-4xl font-bold">Promise Post Message</h1>
        <p>
          Enter some text and click the &quot;Get Data&quot; button in the Web
          View iFrame. The Web View will fetch the data from the parent window.
          Usage{" "}
          <Link
            href="https://github.com/khou22/async-post-message#usage"
            target="_blank"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            docs
          </Link>{" "}
          available.
        </p>

        <div className="w-full flex flex-col gap-y-1">
          <label className="text-sm font-bold">
            Promise Latency (optional)
          </label>
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

        <div className="max-w-3xl w-full flex flex-row justify-between items-center mt-16">
          <p>
            Made by{" "}
            <a
              href="https://linkedin.com/in/kevinhou22"
              className="text-blue-500 underline hover:text-blue-600"
            >
              Kevin Hou
            </a>
          </p>
          <a
            href="https://codeium.com?repo_name=khou22%2Fasync-post-message"
            target="_blank"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="Codeium" src="https://codeium.com/badges/main" />
          </a>
        </div>
      </main>
    </>
  );
}
