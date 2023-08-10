import EtherscanApi from "./etherscan";

describe("EtherscanApi", () => {
  it("getLatestN", async () => {
    const etherscan = new EtherscanApi();
    const latestBlock = await etherscan.latestBlockNumber();
    const blocks = await etherscan.latestNBlocks(3);

    expect(blocks.map((each) => Number(each.number))).toContain(latestBlock);
    expect(blocks.length).toEqual(3);
  });
});
