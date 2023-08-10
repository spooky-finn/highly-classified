import EtherscanApi, { Block } from "./infra/etherscan";

export function getBalanceChanges(blocks: Block[]): Record<string, number> {
  const balances: Record<string, number> = {};

  for (const block of blocks) {
    for (const tx of block.transactions) {
      const sender = tx.from;
      const receiver = tx.to;
      const value = Number(tx.value) / 1e18; // wei to eth

      balances[sender] = (balances[sender] || 0) - value;
      balances[receiver] = (balances[receiver] || 0) + value;
    }
  }

  return balances;
}

export function getMostChangedAddress(balanceChanges: Record<string, number>) {
  let mostChangedAddress = Object.keys(balanceChanges)[0];

  for (const address in balanceChanges) {
    if (
      Math.abs(balanceChanges[address]) >
      Math.abs(balanceChanges[mostChangedAddress])
    ) {
      mostChangedAddress = address;
    }
  }

  return mostChangedAddress;
}

export async function useCaseMostChangedBalance() {
  try {
    const etherscan = new EtherscanApi();
    const blocks = await etherscan.latestNBlocks(100);

    const balances = getBalanceChanges(blocks);
    const mostChangedAddress = getMostChangedAddress(balances);

    return {
      address: mostChangedAddress,
      balance_change: balances[mostChangedAddress],
    };
  } catch (error) {
    console.error("error", error);
    throw error;
  }
}
