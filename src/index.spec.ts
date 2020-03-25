/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable import/no-extraneous-dependencies */
import { Lambda, SecretsManager, KMS, SNS } from "aws-sdk";
import { on } from "@jurijzahn8019/aws-promise-jest-mock";
import { paginate } from "./index";

jest.mock("aws-sdk");

describe("paginate core", () => {
  it("Should paginate over pagination api", async () => {
    const src: SecretsManager.SecretListType = [
      { Name: "foo" },
      { Name: "bar" },
      { Name: "baz" },
    ];

    const listFunc = on(SecretsManager)
      .mock("listSecrets")
      .resolve(() => {
        return {
          SecretList: src.splice(0, 1),
          NextToken: src.length > 0 ? `Next: ${src.length}` : undefined,
        };
      });

    const res = await paginate(new SecretsManager(), "listSecrets");

    expect(res).toMatchSnapshot();
    expect(res.SecretList).toHaveLength(3);
    expect(listFunc.mock).toHaveBeenCalledTimes(3);
    expect(listFunc.mock.mock.calls).toMatchSnapshot("Inputs");
  });

  it("Should work with Any supports NextToken", async () => {
    const src: SNS.TopicsList = [{ TopicArn: "foo" }, { TopicArn: "bar" }];
    const listFunc = on(SNS)
      .mock("listTopics")
      .resolve(() => {
        return {
          Topics: src.splice(0, 1),
          NextToken: src.length > 0 ? `Next: ${src.length}` : undefined,
        };
      });

    const svc = new SNS();
    const res = await paginate<SNS, "listTopics", SNS.ListTopicsInput>(
      svc,
      "listTopics"
    );

    expect(res).toMatchSnapshot();
    expect(res.Topics).toHaveLength(2);
    expect(listFunc.mock).toHaveBeenCalledTimes(2);
    expect(listFunc.mock.mock.calls).toMatchSnapshot("Inputs");
  });

  it("Should work with Any with configurations", async () => {
    const src: SNS.TopicsList = [{ TopicArn: "foo" }, { TopicArn: "bar" }];
    const listFunc = on(SNS)
      .mock("listTopics")
      .resolve(() => {
        return {
          Topics: src.splice(0, 1),
          FooToken: src.length > 0 ? `Next: ${src.length}` : undefined,
        };
      });

    const svc = new SNS();
    const res = await paginate<SNS, "listTopics", SNS.ListTopicsInput>(
      svc,
      "listTopics",
      undefined,
      "FooMarker" as any,
      "FooToken" as any
    );

    expect(res).toMatchSnapshot();
    expect(res.Topics).toHaveLength(2);
    expect(listFunc.mock).toHaveBeenCalledTimes(2);
    expect(listFunc.mock.mock.calls).toMatchSnapshot("Inputs");
  });
});

describe("paginate", () => {
  it("Should work with KMS", async () => {
    const src: KMS.KeyList = [{ KeyId: "foo" }, { KeyId: "bar" }];
    const listFunc = on(KMS)
      .mock("listKeys")
      .resolve(() => {
        return {
          Keys: src.splice(0, 1),
          NextMarker: src.length > 0 ? `Next: ${src.length}` : undefined,
        };
      });

    const kms = new KMS();
    const res = await paginate(kms, "listKeys", {});

    expect(res).toMatchSnapshot();
    expect(res.Keys).toHaveLength(2);
    expect(listFunc.mock).toHaveBeenCalledTimes(2);
    expect(listFunc.mock.mock.calls).toMatchSnapshot("Inputs");
  });

  it("Should work with Lambda", async () => {
    const src: Lambda.Types.FunctionList = [
      { FunctionName: "foo" },
      { FunctionName: "bar" },
    ];
    const listFunc = on(Lambda)
      .mock("listFunctions")
      .resolve(() => {
        return {
          Functions: src.splice(0, 1),
          NextMarker: src.length > 0 ? `Next: ${src.length}` : undefined,
        };
      });

    const kms = new Lambda();
    const res = await paginate(kms, "listFunctions", { MaxItems: 100 });

    expect(res).toMatchSnapshot();
    expect(res.Functions).toHaveLength(2);
    expect(listFunc.mock).toHaveBeenCalledTimes(2);
    expect(listFunc.mock.mock.calls).toMatchSnapshot("Inputs");
  });

  it("Should work with SecretsManager", async () => {
    const src: SecretsManager.Types.SecretListType = [
      { Name: "foo" },
      { Name: "bar" },
    ];
    const listFunc = on(SecretsManager)
      .mock("listSecrets")
      .resolve(() => {
        return {
          SecretList: src.splice(0, 1),
          NextToken: src.length > 0 ? `Next: ${src.length}` : undefined,
        };
      });

    const kms = new SecretsManager();
    const res = await paginate(kms, "listSecrets", { MaxResults: 100 });

    expect(res).toMatchSnapshot();
    expect(res.SecretList).toHaveLength(2);
    expect(listFunc.mock).toHaveBeenCalledTimes(2);
    expect(listFunc.mock.mock.calls).toMatchSnapshot("Inputs");
  });
});
