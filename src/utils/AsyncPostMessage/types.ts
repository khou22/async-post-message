export type AsyncPostMessageRequest = {
  uid: string;
  functionName: string;
  args: any[];
};

export type AsyncPostMessageResponse = {
  uid: string;
  functionName: string;
  response: any;
  error?: string;
};

export interface Promises {
  [functionName: string]: (...args: any[]) => any;
}
