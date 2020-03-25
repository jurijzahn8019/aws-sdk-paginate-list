/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service } from "aws-sdk";
import { Request } from "aws-sdk/lib/request";

/**
 * Util Type to extract result of a request to get its contains
 */
export type UnwrapRequest<T> = T extends Request<infer U, any> ? U : T;

export type PromiseFunc<P = object> = (params: P) => Request<any, any>;

/**
 * Uses Dark Energy (any) to paginate list function
 * The Given Function should support NextToken
 *
 * @param service
 * @param func
 * @param param
 */
export async function paginate<
  F extends (...args: any[]) => any,
  S extends Service = Service,
  M extends keyof S = any,
  P extends S[M] extends F ? Parameters<F> : any = any,
  R extends S[M] extends F ? UnwrapRequest<ReturnType<F>> : never = any,
  T extends keyof P = any
>(service: S, func: M, param?: P, token?: T): Promise<Omit<R, T>> {
  const prm: any = param || {};
  const bound = ((service[func] as unknown) as (args?: P) => R).bind(service);
  const res = {} as any;
  const tkn = token || "NextToken";

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const resp = (await ((bound(prm) as unknown) as Request<
      any,
      any
    >).promise()) as any;

    Object.entries(resp).forEach(([k, v]: [string, any]) => {
      if (!res[k]) {
        res[k] = v;
      } else if (Array.isArray(v)) {
        res[k].push(...v);
      }
    });

    if (resp[tkn] === undefined || resp[tkn] === "") {
      break;
    }

    // eslint-disable-next-line no-param-reassign
    prm[tkn] = resp[tkn];
  }

  return res;
}
