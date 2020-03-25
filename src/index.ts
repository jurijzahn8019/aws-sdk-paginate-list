/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, Request } from "aws-sdk";
import { PaginationRequest, getTokenParam } from "./mappings";
import type { UnwrapRequest, ResponsePromise } from "./common";

/**
 * Uses Dark Energy (any) to paginate list function
 * This is done by looking at the result field identified by tokenField
 *
 * @param service The Service object to call the function on
 * @param func name of the function in the aws Service Object
 * @param params parameter which should be passed to the list function
 * @param tokenField field name on the result holding the pagination token
 */
async function paginateInternal<
  S extends Service = Service,
  M extends keyof S = any,
  P = S[M] extends (param: any, callback: any) => any
    ? Parameters<S[M]>[0]
    : never,
  R = S[M] extends (...args: any[]) => Request<any, any>
    ? UnwrapRequest<ReturnType<S[M]>>
    : never,
  T extends keyof P = never
>(service: S, func: M, params?: P, tokenField?: T): ResponsePromise<P, R, T> {
  let prm: any = params || {};
  const bound = ((service[func] as unknown) as (args?: P) => R).bind(service);
  const res = {} as any;
  const tkn = tokenField || "NextToken";

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

    prm = { ...prm, [tkn]: resp[tkn] };
  }

  return res;
}

export function paginate<
  S extends Service,
  F extends keyof S,
  P extends PaginationRequest<S, F>,
  R = S[F] extends (...args: any[]) => Request<any, any>
    ? UnwrapRequest<ReturnType<S[F]>>
    : never,
  T extends keyof R = any
>(
  service: S,
  func: F,
  param?: P,
  nextTokenParam?: T
): ResponsePromise<P, R, keyof P> {
  const tokenParam = nextTokenParam || getTokenParam(service);
  return paginateInternal<S>(service, func, param as any, tokenParam as any);
}

export * from "./common";
export * from "./mappings";
