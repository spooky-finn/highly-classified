import { Block } from "../infra/etherscan";
import { getBalanceChanges, getMostChangedAddress } from "./mostChangedBalance";

describe("Index", () => {
  it("getBalanceChanges", () => {
    const blocks: Block[] = [
      {
        number: "0x1",
        transactions: [
          {
            from: "0x1",
            to: "0x2",
            value: "0xaa9f075c200000",
          },
          {
            from: "0x3",
            to: "0x4",
            value: "0x13f306a2409fc0000",
          },
          {
            from: "0x1",
            to: "0x4",
            value: "0x13f306a2409fc0000",
          },
        ],
      },
    ];

    const balanceChanges = getBalanceChanges(blocks);
    expect(balanceChanges).toEqual({
      "0x1": -0.0480256 - 23,
      "0x2": 0.0480256,
      "0x3": -23,
      "0x4": 23 + 23,
    });
  });

  it("getMostChangedAddres", () => {
    const balanceChanges = {
      "0x1": -0.0480256 - 23,
      "0x2": 0.0480256,
      "0x3": -23,
      "0x4": 23 + 23,
    } as Record<string, number>;

    expect(getMostChangedAddress(balanceChanges)).toEqual("0x4");
  });
});
