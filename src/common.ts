/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Request } from "aws-sdk";

/**
 * Util Type to extract result of a request to get its contains
 */
export type UnwrapRequest<T> = T extends Request<infer U, any> ? U : T;

export type ResponseType<P, R, T extends keyof P> = Omit<R, T>;

export type ResponsePromise<P, R, T extends keyof P> = Promise<
  ResponseType<P, R, T>
>;

export type AnyParam = Record<string, any>;
