# Async Post Message

[![built with Codeium](https://codeium.com/badges/main)](https://codeium.com?repo_name=khou22%2Fasync-post-message) ![GitHub followers](https://img.shields.io/github/followers/khou22) ![X (formerly Twitter) Follow](https://img.shields.io/twitter/follow/kevinhou22)

I have been using the Javascript `postMessage` [[docs](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)] to communicate between frames, but have been frustrated that communication is not strongly guaranteed. You can send a message reliably, but there is no notion of an async call --> response. Rather, you can send a message to the other context and hope you get a response. You need to instrument listening to the correct response and yet this is still quite complex if you want to run an `async` request.

In this demo, I create a promise wrapper around the `postMessage` Javascript API and handle sending messages between contexts so that you can simply run `await asyncPromise.send('functionName', [...args])` in your client code.

## Demo

[![Demo](/docs/demo.gif)](/docs/demo.gif)

## Usage

### Installation

```bash
npm install async-post-message

yarn add async-post-message

bun install async-post-message
```

### Getting Started

Define the promises types that you would like to execute across the frame contexts:

```typescript
export type MyPromises = {
    getText: () => string;
    multiplyByFour: (n: number) => number;
};
```

The parent process needs to be set up to handle the promise requests:

```typescript
// var iframe: HTMLIFrameElement = ...;
const unsubscribe = handleWebViewRequest<MyPromises>(
    iframe.contentWindow,
    async (request) => {
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
        }
    }
);
```

On the iFrame page (or other web view that can `postMessage`), create a new `AsyncPostMessage` singleton instance with the promise interface as the generic argument. You can then call `execute` with the function name and signature.

```typescript
const asyncPostMessage = WebViewRequester.getInstance<MyPromises>();

// Execute the asynchronous request to the parent.
const response = await asyncPostMessage.execute("multiplyByFour", 4);
console.log(response); // 16
```

### Usage in React

You may want to use this system in React. The big change here is that you'll want to wrap things in `ref`'s and `useEffect`s.

Define the promises types that you would like to execute across the frame contexts:

```typescript
export type MyPromises = {
    getText: () => string;
    multiplyByFour: (n: number) => number;
    induceError: () => boolean;
};
```

#### Parent Window

The parent process needs to be set up to handle the promise requests:

```tsx
const iframeRef = useRef<HTMLIFrameElement>(null);

useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;

    const unsubscribe = handleWebViewRequest<MyPromises>(
        iframeRef.current.contentWindow,
        async (request) => {
        const { uid, functionName, args } = request;
        switch (functionName) {
            case "multiplyByFour": {
                const argsTyped = args as Parameters<MyPromises["multiplyByFour"]>;
                const response = 4 * argsTyped[0];
                return {
                    uid,
                    functionName: "multiplyByFour",
                    response,
                };
            }
        }
    );

    return () => {
        unsubscribe();
    };
}, []);
```

#### iFrame Web View

On the iFrame page, create a new `AsyncPostMessage` instance with the promise interface as the generic argument.

```tsx
const asyncPostMessage = useRef(new AsyncPostMessage<MyPromises>());

// Check to ensure it can run in an iFrame.
useEffect(() => {
    if (!window) {
        setError(new Error("Not an iFrame"));
    }
    asyncPostMessage.current = WebViewRequester.getInstance<MyPromises>();
}, []);
```

Now to call a promise you can simply call the `send()`:

```ts
const response = await asyncPostMessage.current.send("multiplyByFour", 4);
console.log(response); // 16
```

## Development

### Building

1. `yarn install`
2. `yarn build` which will generate the `dist/` folder
3. To deploy to NPM, run `npm publish`

### Running Demo Locally

First, navigate to `/apps/www`.

1. Install dependencies: `bun install`
2. Run dev server: `bun dev`
3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.
