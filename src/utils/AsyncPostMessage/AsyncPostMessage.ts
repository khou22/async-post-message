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
   * @returns A promise that resolves with the return value of the function
   */
  public send = <FnNameType extends keyof PromisesInterface & string>(
    functionName: FnNameType,
    args: Parameters<PromisesInterface[FnNameType]>
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
      }
    );

    return promise;
  };

  public onResponse(
    message: AsyncPostMessageResponse<PromisesInterface>
  ): void {
    const callback = this.callbacks.get(message.uid);
    if (callback) {
      this.callbacks.delete(message.uid);
      if (message.error) {
        callback.reject(message.error);
      } else {
        callback.resolve(message.response);
      }
    }
  }

  public postMessage(
    _message: AsyncPostMessageRequest<PromisesInterface>
  ): void {
    console.warn("[AsyncPostMessage] postMessage unimplemented");
  }
}
