"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { WebViewRequester } from "../../../../../src/WebViewRequester";
import { PAGES } from "@/utils/pages";
import { AlertTriangle, CheckCircle2Icon } from "lucide-react";
import { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The promises that I want to execute between the parent and the iFrame contexts.
 */
export type MyPromises = {
  getText: () => string;
  multiplyByFour: (n: number) => number;
  induceError: () => boolean;
};

const WebviewPage: NextPage = () => {
  const asyncPostMessage = useRef<WebViewRequester<MyPromises>>();

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!window) {
      setError(new Error("Not an iFrame"));
    }
    asyncPostMessage.current = WebViewRequester.getInstance<MyPromises>();
  }, []);

  const handleFetch = useCallback(async (functionName: keyof MyPromises) => {
    setValue("");
    setLoading(true);
    setError(null);
    try {
      if (!asyncPostMessage.current) {
        throw new Error("Not an iFrame");
      }

      if (functionName === "multiplyByFour") {
        const response = await asyncPostMessage.current.execute(
          "multiplyByFour",
          [2],
          { timeoutMs: 3000 }
        );
        setValue(String(response));
      } else if (functionName === "getText") {
        const response = await asyncPostMessage.current.execute("getText", [], {
          timeoutMs: 3000,
        });
        setValue(response);
      } else if (functionName === "induceError") {
        await asyncPostMessage.current.execute("induceError", [], {
          timeoutMs: 3000,
        });
      }
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e);
      } else {
        setError(new Error(String(e)));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-4 m-auto gap-y-8 min-h-screen bg-white">
      <div className="text-center">
        <h1 className="text-3xl mb-2">iFrame Web View</h1>
        <pre>{PAGES.WEBVIEW}</pre>
      </div>

      <p className="max-w-xl">
        Click the button below to fetch data from the parent window. It will
        make a request via the synchronous `postMessage` API, but will be used
        as if it were an asynchronous request.
      </p>

      <div className="flex flex-col justify-center items-center gap-y-2">
        <div className="flex flex-row items-center justify-around gap-x-2">
          <Button onClick={() => handleFetch("getText")} disabled={isLoading}>
            Fetch Text
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleFetch("multiplyByFour")}
            disabled={isLoading}
          >
            Multiply 2 by 4
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleFetch("induceError")}
            disabled={isLoading}
          >
            Induce Error
          </Button>
        </div>
        <p className="text-gray-500 text-sm italic">
          {isLoading
            ? "Loading..."
            : "Will fire a promise wrapped postMessage."}
        </p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Promise Error</AlertTitle>
          <AlertDescription>
            Error firing promise to the parent:
            <pre className="break-word whitespace-break-spaces">
              {error.message}
            </pre>
          </AlertDescription>
        </Alert>
      )}

      {value && (
        <Alert>
          <CheckCircle2Icon className="h-4 w-4 stroke-green-500" />
          <AlertTitle>Successful Fetch</AlertTitle>
          <AlertDescription>
            <pre>{value}</pre>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default WebviewPage;
