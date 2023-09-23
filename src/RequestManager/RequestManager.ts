import { generateAlphaNumericUniqueId } from "../utils";
import {
  AsyncPostMessageRequest,
  AsyncPostMessageResponse,
  CallbackType,
  Promises,
  UidType,
} from "./types";

/**
 * A class for managing async postMessage requests and their promise wrappers. Each instance
 * stores a map of callbacks for each unique ID. It does not wrap the `postMessage` API. Instead,
 * it allows the client to set the listener and postMessage methods on their own.
 */
export class RequestManager<PromisesInterface extends Promises> {
  /**
   * Map of callbacks for each promise's unique ID.
   */
  private callbacks: Map<UidType, CallbackType>;

  constructor() {
    this.callbacks = new Map();
  }

  /**
   * Send a strongly typed async postMessage request.
   *
   * @param functionName The name of the function to call
   * @param args The arguments to pass to the function
   * @param options Options for the request. Defaults to a timeout of 10 seconds. If `0` is passed
   * as the timeout, the request will not timeout.
   * @returns A promise that resolves with the return value of the function
   */
  public send = <FnNameType extends keyof PromisesInterface & string>(
    functionName: FnNameType,
    args: Parameters<PromisesInterface[FnNameType]>,
    options?: { timeoutMs: number }
  ): Promise<ReturnType<PromisesInterface[FnNameType]>> => {
    // Generate a unique ID for this request.
    const uid = generateAlphaNumericUniqueId();

    const promise = new Promise<ReturnType<PromisesInterface[FnNameType]>>(
      (resolve, reject) => {
        this.callbacks.set(uid, { resolve, reject });
        const message: AsyncPostMessageRequest<PromisesInterface> = {
          uid,
          functionName,
          args,
        };
        this.postMessage(message);

        // Set a timeout for the request (defaults to 10 seconds).
        const timeout = options?.timeoutMs ?? 10000;
        if (timeout > 0) {
          setTimeout(() => {
            reject(new Error(`${functionName} timed out (id: ${uid})`));
            this.callbacks.delete(uid);
          }, timeout);
        }
      }
    );

    return promise;
  };

  /**
   * Handler for postMessages to the client.
   *
   * @param message Message payload received by the webview.
   */
  public onResponse(
    message: AsyncPostMessageResponse<PromisesInterface>
  ): void {
    const callback = this.callbacks.get(message.uid);

    // If the callback is not defined, do nothing as it means the request timed out.
    if (!callback) {
      return;
    }

    this.callbacks.delete(message.uid);
    if (message.error) {
      callback.reject(new Error(message.error));
    } else {
      callback.resolve(message.response);
    }
  }

  /**
   * Send a strongly typed async postMessage request to the target. This should be set by the
   * client.
   *
   * @param _message Message payload to send to the target.
   */
  public postMessage(
    _message: AsyncPostMessageRequest<PromisesInterface>
  ): void {
    console.warn("[AsyncPostMessage] postMessage unimplemented");
  }
}
