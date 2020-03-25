import { Lambda, SecretsManager } from "aws-sdk";
import { paginate } from "./index";

describe("paginate", () => {
  it("Should return first batch", async () => {
    const lambda = new Lambda();
    const res = await paginate<{
      (
        params: Lambda.Types.ListAliasesRequest
      ): Lambda.Types.ListAliasesResponse;
    }>(lambda, "listAliases");

    expect(res).toBe(undefined);
  });

  it("Should return first batchs", async () => {
    const secretsManager = new SecretsManager();
    const res = await paginate<>(secretsManager, "listSecrets");

    expect(res).toBe(undefined);
  });
});
