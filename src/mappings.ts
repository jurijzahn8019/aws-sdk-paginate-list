/* eslint-disable @typescript-eslint/no-explicit-any */
import { Service, SecretsManager, Lambda, KMS } from "aws-sdk";
import type { AnyParam } from "./common";

export type PaginationRequest<S, F extends keyof S = any> = S extends KMS
  ? KMSPaginationRequest<S, F>
  : S extends Lambda
  ? LambdaPaginationRequest<S, F>
  : S extends SecretsManager
  ? SecretsManagerPaginationRequest<S, F>
  : AnyParam;

export type SecretsManagerPaginationRequest<
  S extends SecretsManager,
  T extends keyof S
> = T extends "listSecrets"
  ? SecretsManager.Types.ListSecretsRequest
  : T extends "listSecretVersionIds"
  ? SecretsManager.Types.ListSecretVersionIdsRequest
  : AnyParam;

export type LambdaPaginationRequest<
  S extends Lambda,
  T extends keyof S
> = T extends "listAliases"
  ? Lambda.Types.ListAliasesRequest
  : T extends "listFunctions"
  ? Lambda.Types.ListFunctionsRequest
  : T extends "listLayers"
  ? Lambda.Types.ListLayersRequest
  : AnyParam;

export type KMSPaginationRequest<
  S extends KMS,
  T extends keyof S
> = T extends "listAliases"
  ? KMS.ListAliasesRequest
  : T extends "listKeys"
  ? KMS.ListKeysRequest
  : AnyParam;

export function getTokenParam<S extends Service>(
  service: S
): string | undefined {
  return service instanceof KMS
    ? "NextMarker"
    : service instanceof SecretsManager
    ? "NextToken"
    : service instanceof Lambda
    ? "NextMarker"
    : undefined;
}
