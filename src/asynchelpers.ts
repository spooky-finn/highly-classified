import { setTimeout, setInterval } from "timers/promises";

export class PromiseBatcher<R> {
  private queue: Array<() => Promise<R>> = [];
  private results: R[] = [];

  constructor(private readonly rps: number) {}

  public add(promise: () => Promise<R>) {
    this.queue.push(promise);
  }

  get length() {
    return this.queue.length;
  }

  public async run(): Promise<R[]> {
    if (this.queue.length === 0) throw new Error("No requests to run.");

    return new Promise(async (resolve, reject) => {
      for await (const _ of setInterval(1100)) {
        if (this.complited()) {
          resolve(this.results);
          break;
        }

        try {
          await this.executeBatch();
        } catch (error) {
          console.error("Error in batch: " + error);
          reject("Error in batch: " + error);
          break;
        }
      }
    });
  }

  private complited() {
    if (this.queue.length <= 0) {
      return true;
    }
    return false;
  }

  private async executeBatch() {
    const batch = this.queue.splice(0, this.rps);
    const res = await Promise.all(batch.map((each) => each()));
    this.results.push(...res);
  }
}

export async function parralдelRequest<R>(requests: (() => Promise<R>)[]) {
  const res = Promise.all(requests.map((request) => request()));
  return res;
}

export async function withRetry<R>(
  requestfn: () => Promise<R>,
  max_retries = 3,
  min_delay = 1000
): Promise<R> {
  return new Promise((resolve, reject) => {
    let retries = 1;

    const executeRequest = async () => {
      try {
        const response = await requestfn();
        resolve(response);
      } catch (error) {
        if (retries < max_retries) {
          retries++;
          await setTimeout(min_delay * retries);

          executeRequest();
        } else reject("Max retries exceeded: " + error);
      }
    };

    executeRequest();
  });
}
