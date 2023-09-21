export type AsyncPostMessageRequest<PromisesInterface extends Promises> = {
  uid: string;
  functionName: keyof PromisesInterface & string;
  args: Parameters<PromisesInterface[keyof PromisesInterface & string]>;
};

export type AsyncPostMessageResponse<PromisesInterface extends Promises> = {
  uid: string;
  functionName: keyof PromisesInterface & string;
  response: ReturnType<
    PromisesInterface[keyof PromisesInterface & string]
  > | null;
  error?: string | null;
};

export interface Promises {
  [functionName: string]: (...args: any[]) => any;
}
