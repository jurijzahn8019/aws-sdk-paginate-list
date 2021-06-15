/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, Request } from "aws-sdk";
import { PaginationRequest, getTokenParams } from "./mappings";
import type { UnwrapRequest, AnyParam } from "./common";

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
  NP extends keyof P = any,
  NR extends keyof R = any
>(
  service: S,
  func: M,
  tokenFields: {
    responseToken: NR;
    paramToken: NP;
  },
  params?: P
): Promise<R> {
  let prm: any = params || {};
  const bound = (service[func] as unknown as (args?: P) => R).bind(service);
  const res = {} as any;
  const { paramToken, responseToken } = tokenFields;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const resp = (await (
      bound(prm) as unknown as Request<any, any>
    ).promise()) as any;

    Object.entries(resp).forEach(([k, v]: [string, any]) => {
      if (!res[k]) {
        res[k] = v;
      } else if (Array.isArray(v)) {
        res[k].push(...v);
      }
    });

    if (resp[responseToken] === undefined || resp[responseToken] === "") {
      break;
    }

    prm = { ...prm, [paramToken]: resp[responseToken] };
  }

  return res;
}

export async function paginate<
  S extends Service,
  F extends keyof S,
  P extends PaginationRequest<S, F>,
  R extends S[F] extends (...args: any[]) => Request<any, any>
    ? UnwrapRequest<ReturnType<S[F]>>
    : AnyParam = S[F] extends (...args: any[]) => Request<any, any>
    ? UnwrapRequest<ReturnType<S[F]>>
    : AnyParam
>(
  service: S,
  func: F,
  params?: P,
  paramToken?: keyof P,
  responseToken?: keyof R
): Promise<R> {
  const tokenResponse = responseToken || paramToken;
  const tokenParams = {
    ...getTokenParams(service),
    ...(paramToken ? { paramToken } : {}),
    ...(tokenResponse ? { responseToken: tokenResponse } : {}),
  };

  return paginateInternal<S>(service, func, tokenParams, params as any);
}

export * from "./common";
export * from "./mappings";
