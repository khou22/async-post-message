"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AsyncPostMessage } from "@/utils/AsyncPostMessage/AsyncPostMessage";
import { AsyncPostMessageResponse } from "@/utils/AsyncPostMessage/types";
import { PAGES } from "@/utils/pages";
import { AlertTriangle, CheckCircle2Icon } from "lucide-react";
import { NextPage } from "next";
import { useCallback, useEffect, useRef, useState } from "react";

export type MyPromises = {
  getText: () => string;
  multiplyByFour: (n: number) => number;
};

const WebviewPage: NextPage = () => {
  const asyncPostMessage = useRef(new AsyncPostMessage<MyPromises>());

  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!window) {
      setError(new Error("Not an iFrame"));
    }
  }, []);

  useEffect(() => {
    const handleMessage = (
      event: MessageEvent<AsyncPostMessageResponse<MyPromises>>
    ) => {
      asyncPostMessage.current.onResponse(event.data);
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const handleFetch = useCallback(async (functionName: keyof MyPromises) => {
    // Send a request to the parent window.
    asyncPostMessage.current.postMessage = (message) => {
      console.debug("postMessage", message);
      window.parent.postMessage(message);
    };

    setValue("");
    setLoading(true);
    setError(null);
    try {
      if (functionName === "multiplyByFour") {
        const response = await asyncPostMessage.current.send("multiplyByFour", [
          2,
        ]);
        setValue(String(response));
      } else if (functionName === "getText") {
        const response = await asyncPostMessage.current.send("getText", []);
        setValue(response);
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
    <div className="flex flex-col items-center justify-center p-4 max-w-md m-auto gap-y-8">
      <div className="text-center">
        <h1 className="text-3xl mb-2">Web View</h1>
        <pre>{PAGES.WEBVIEW}</pre>
      </div>

      <p>
        Click the button below to fetch data from the parent window. It will
        make a request via the synchronous `postMessage` API, but will be used
        as if it were an asynchronous request.
      </p>

      <div className="flex flex-col justify-center items-center gap-y-2">
        <div className="flex flex-row items-center justify-around gap-x-2">
          <Button
            onClick={() => handleFetch("multiplyByFour")}
            disabled={isLoading}
          >
            Fetch Text
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleFetch("multiplyByFour")}
            disabled={isLoading}
          >
            Multiply 2 by 4
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
          <AlertTitle>Error Fetching</AlertTitle>
          <AlertDescription>
            Error firing promise to the parent: {error.message}
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
