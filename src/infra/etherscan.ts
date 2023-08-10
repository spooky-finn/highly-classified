import axios from "axios";
import { parralдelRequest, withRetry } from "../src/asynchelpers";

const API_RPS_TRESHOLD = 5;
const API_KEY = "31TDR81FX126W98P3Z345FFQMGIJJBIB6S";
export interface Transaction {
  from: string;
  to: string;
  value: string;
}

export interface Block {
  transactions: Transaction[];
  number: string;
}

export default class EtherscanApi {
  constructor(private readonly api_key: string = API_KEY) {}

  public async latestBlockNumber(): Promise<number> {
    const response = await axios.get("https://api.etherscan.io/api", {
      params: {
        module: "proxy",
        action: "eth_blockNumber",
        apikey: this.api_key,
      },
    });

    if (response.status !== 200 || response.data.status == 0) {
      throw new Error("Failed to get block number.");
    }

    return parseInt(response.data.result, 16);
  }

  public async blockByNumber(blockNumber: number): Promise<Block> {
    const response = await axios.get("https://api.etherscan.io/api", {
      params: {
        module: "proxy",
        action: "eth_getBlockByNumber",
        tag: `0x${blockNumber.toString(16)}`,
        boolean: "true",
        apikey: this.api_key,
      },
    });

    if (response.status !== 200 || response.data.status == 0) {
      throw new Error(
        `Failed to get block ${blockNumber} status ${response.status}`
      );
    }

    return response.data.result;
  }

  public async latestNBlocks(n: number): Promise<Block[]> {
    const lastBlock = await this.latestBlockNumber();
    const startBlock = Math.max(0, lastBlock - n + 1);

    const promises: Array<() => Promise<Block>> = [];

    const blocks: Block[] = [];
    for (
      let blockNumber = startBlock;
      blockNumber <= lastBlock;
      blockNumber++
    ) {
      const cb = () => withRetry(() => this.blockByNumber(blockNumber));
      promises.push(cb);
    }

    for (let i = 0; i < promises.length; i += API_RPS_TRESHOLD) {
      const batch = promises.slice(i, i + API_RPS_TRESHOLD);
      blocks.push(...(await parralдelRequest(batch)));

      if (n % blocks.length === 0) {
        console.log("pulled", blocks.length, "blocks");
      }
    }

    return blocks;
  }
}
