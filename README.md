# Async Post Message

[![built with Codeium](https://codeium.com/badges/main)](https://codeium.com?repo_name=khou22%2Fasync-post-message) ![GitHub followers](https://img.shields.io/github/followers/khou22) ![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/kevinhou22)

I have been using the Javascript `postMessage` [[docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)] to communicate between frames, but have been frustrated that communication is not strongly guaranteed. You can send a message reliably, but there is no notion of an async call --> response. Rather, you can send a message to the other context and hope you get a response. You need to instrument listening to the correct response and yet this is still quite complex if you want to run an `async` request.

In this demo, I create a promise wrapper around the `postMessage` Javascript API and handle sending messages between contexts so that you can simply run `await asyncPromise.send('functionName', [...args])` in your client code.

## Demo

[![Demo](/docs/demo.gif)](/docs/demo.gif)

## Usage

Define the promises types that you would like to execute across the frame contexts:

```typescript
export type MyPromises = {
  getText: () => string;
  multiplyByFour: (n: number) => number;
  induceError: () => boolean;
};
```

### Parent Window

The parent process needs to be set up to handle the promise requests:

```tsx
useEffect(() => {
    const handleMessage = async (
        event: MessageEvent<AsyncPostMessageRequest<MyPromises>>
    ) => {
        const { uid, functionName, args } = event.data;
        switch (functionName) {
            case "multiplyByFour": {
                iframeRef.current.contentWindow.postMessage({
                    uid,
                    functionName: "multiplyByFour",
                    response: 4 * args[0],
                });
                break;
            }
    };

    window.addEventListener("message", handleMessage);
    return () => {
        window.removeEventListener("message", handleMessage);
    };
}, [fetchLatency, textValue]);
```

### iFrame Web View

On the iFrame page, create a new `AsyncPostMessage` instance with the promise interface as the generic argument.

```tsx
const asyncPostMessage = useRef(new AsyncPostMessage<MyPromises>());

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
```

Now to call a promise you can simply call the `send()`:

```ts
const response = await asyncPostMessage.current.send("multiplyByFour", 4);
console.log(response); // 16
```

## Open Source

### Running Demo Locally

1. Install dependencies: `bun install`
2. Run dev server: `bun dev`
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
