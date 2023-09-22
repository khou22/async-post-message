import { getUUID } from "../uuid";
import {
  AsyncPostMessageRequest,
  AsyncPostMessageResponse,
  Promises,
} from "./types";

type UidType = string;
type CallbackType = {
  resolve: (data: any) => void;
  reject: (error: string) => void;
};

export class AsyncPostMessage<PromisesInterface extends Promises> {
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
    const uid = getUUID();

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
            reject(`${functionName} timed out (id: ${uid})`);
            this.callbacks.delete(uid);
          }, timeout);
        }
      }
    );

    return promise;
  };

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
      callback.reject(message.error);
    } else {
      callback.resolve(message.response);
    }
  }

  public postMessage(
    _message: AsyncPostMessageRequest<PromisesInterface>
  ): void {
    console.warn("[AsyncPostMessage] postMessage unimplemented");
  }
}
