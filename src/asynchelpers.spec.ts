import { PromiseBatcher, withRetry } from "./asynchelpers";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("withRetry", () => {
  test("should retry request 3 times", async () => {
    const request = jest.fn().mockRejectedValue("Failed");

    const promise = withRetry(request, 3, 10);
    await expect(promise).rejects.toContain("Max retries exceeded");
    expect(request).toHaveBeenCalledTimes(3);
  });

  test("should resolve request", async () => {
    const request = jest.fn().mockResolvedValue("Success");

    const promise = withRetry(request, 3, 10);
    await expect(promise).resolves.toEqual("Success");
    expect(request).toHaveBeenCalledTimes(1);
  });

  test("should reject first request but resolve next", async () => {
    let counter = 0;
    const request = jest.fn(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          if (counter === 0) {
            reject("Failed");
            counter++;
          } else {
            resolve("Success");
          }
        }, 50);
      });
    });

    const promise = withRetry(request, 3, 10);
    await expect(promise).resolves.toEqual("Success");
    expect(request).toHaveBeenCalledTimes(2);
  });
});

describe("bathRequester", () => {
  it("should batch requests", async () => {
    const request = jest.fn().mockImplementation(async (i: number) => i);

    const batchRequester = new PromiseBatcher<number>(3);

    for (let i = 0; i < 6; i++) {
      const promise = () => request(i);
      batchRequester.add(promise);
    }

    const results = await batchRequester.run();
    expect(results).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it("throw error if one of bathes had failed", async () => {
    const request = jest
      .fn()
      .mockResolvedValue(33)
      .mockResolvedValueOnce(1)
      .mockRejectedValueOnce("Failed");

    const batchRequester = new PromiseBatcher<number>(3);

    for (let i = 0; i < 6; i++) {
      batchRequester.add(request);
    }

    const promise = request(6);
    batchRequester.add(promise);

    try {
      await batchRequester.run();
      // fail("Should throw an error");
    } catch (error) {
      expect(error).toContain("Error in batch");
    }
  });
});
