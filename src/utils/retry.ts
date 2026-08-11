export async function retryAsync<T>(fn: () => Promise<T>, maxAttempts : number = 5): Promise<T> {
  const baseDelayMs = 100;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }

      const delay = baseDelayMs * 2 ** (attempt - 1);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  // This should never happen, but TypeScript needs a return
  throw new Error("retryAsync failed unexpectedly");
}
