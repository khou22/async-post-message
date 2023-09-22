import { RequestManager } from "./RequestManager/RequestManager";
import { AsyncPostMessageResponse, Promises } from "./RequestManager/types";

/**
 * The Singleton class defines the `getInstance` method that lets clients access
 * the unique singleton instance.
 */
export class WebViewRequester<PromisesInterface extends Promises = any> {
  private static instance: WebViewRequester;

  private requestManager: RequestManager<PromisesInterface>;

  /**
   * The Singleton's constructor should always be private to prevent direct
   * construction calls with the `new` operator.
   */
  private constructor() {
    // Setup instance of RequestManager that will be used by all calls.
    this.requestManager = new RequestManager();

    // Listen for messages from the parent.
    window.addEventListener(
      "message",
      (event: MessageEvent<AsyncPostMessageResponse<PromisesInterface>>) => {
        if (!event.data) {
          return;
        }
        this.requestManager.onResponse(event.data);
      }
    );

    // Setup data pipeline to send messages to the parent.
    this.requestManager.postMessage = (message) => {
      window.parent.postMessage(message, "*");
    };
  }

  /**
   * The static method that controls the access to the global AsyncPostMessage instance.
   *
   * We use a singleton so that the client does not need to worry about creating multiple
   * instances of the `AsyncPostMessage` class.
   */
  public static getInstance = <
    PromisesInterface extends Promises
  >(): WebViewRequester<PromisesInterface> => {
    if (!WebViewRequester.instance) {
      WebViewRequester.instance = new WebViewRequester();
    }

    return WebViewRequester.instance;
  };

  /**
   * Execute a strongly typed promise that is executed in the parent process.
   */
  public execute = <FnNameType extends keyof PromisesInterface & string>(
    functionName: FnNameType,
    args: Parameters<PromisesInterface[FnNameType]>,
    options?: { timeoutMs: number }
  ): Promise<ReturnType<PromisesInterface[FnNameType]>> => {
    return this.requestManager.send(functionName, args, options);
  };
}
