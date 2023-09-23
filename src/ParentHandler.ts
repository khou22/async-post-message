import {
  AsyncPostMessageRequest,
  AsyncPostMessageResponse,
  Promises,
} from "./RequestManager/types";

type Unsubscribe = () => void;

export const handleWebViewRequest = <PromisesInterface extends Promises>(
  target: { postMessage: typeof window.postMessage },
  handler: (
    request: AsyncPostMessageRequest<PromisesInterface>
  ) => Promise<AsyncPostMessageResponse<PromisesInterface>>
): Unsubscribe => {
  const handleMessage = async (
    event: MessageEvent<AsyncPostMessageRequest<PromisesInterface>>
  ) => {
    // Execute the business logic.
    const response = await handler(event.data);

    // Send the response back to the iFrame so it can resolve.
    target.postMessage(response, "*");
  };

  window.addEventListener("message", handleMessage);

  return () => {
    window.removeEventListener("message", handleMessage);
  };
};
