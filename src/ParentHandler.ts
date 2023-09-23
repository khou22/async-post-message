import {
  AsyncPostMessageRequest,
  AsyncPostMessageResponse,
  Promises,
} from "./RequestManager/types";

/**
 * Type for unsubscribing from an event listener.
 */
type Unsubscribe = () => void;

/**
 * Handles a requests from the webview using the given callback. This code should be run on the
 * parent context.
 *
 * @param {object} target - The target object that has a postMessage method (ie. iframe).
 * @param {function} handler - The handler function that takes an AsyncPostMessageRequest and
 * returns a Promise of AsyncPostMessageResponse.
 * @return {function} - The unsubscribe function that removes the event listener. Useful for React.
 */
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
