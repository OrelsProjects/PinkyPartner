/**
 * Simulate a random time to finish a request
 * @returns {Promise<void>}
 */
export async function getRandomTimeToFinishRequest(): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, Math.random() * 1000);
  });
}
