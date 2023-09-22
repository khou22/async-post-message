export type UidType = string;

export type CallbackType = {
  resolve: (data: any) => void;
  reject: (error: Error) => void;
};

/**
 * The request object sent from the webview to the parent.
 */
export type AsyncPostMessageRequest<PromisesInterface extends Promises> = {
  uid: string;
  functionName: keyof PromisesInterface & string;
  args: Parameters<PromisesInterface[keyof PromisesInterface & string]>;
};

/**
 * The response object sent from the parent to the webview.
 */
export type AsyncPostMessageResponse<PromisesInterface extends Promises> = {
  uid: string;
  functionName: keyof PromisesInterface & string;
  response: ReturnType<
    PromisesInterface[keyof PromisesInterface & string]
  > | null;
  error?: string | null;
};

/**
 * Base interface for the promise signatures.
 */
export interface Promises {
  [functionName: string]: (...args: any[]) => any;
}
