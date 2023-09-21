"use client";

import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import { useCallback, useState } from "react";

const WebviewPage: NextPage = () => {
  const [isLoading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [value, setValue] = useState("");

  const parent = window.parent;

  const handleFetch = useCallback(() => {
    if (!parent) {
      return;
    }
  }, [parent]);

  return (
    <div className="flex flex-col items-center justify-center p-4 max-w-md m-auto gap-y-8">
      <h1 className="text-3xl">Web View</h1>
      <p>
        Click the button below to fetch data from the parent window. It will
        make a request via the synchronous `postMessage` API, but will be used
        as if it were an asynchronous request.
      </p>

      <div className="flex flex-col justify-center items-center gap-y-2">
        <Button onClick={handleFetch} disabled={isLoading || !parent}>
          Get Data
        </Button>
        <p className="text-gray-500 text-sm italic">
          Will fire a promise wrapped postMessage.
        </p>
      </div>
    </div>
  );
};

export default WebviewPage;
