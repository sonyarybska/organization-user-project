/* eslint-disable no-console */
export default async () => {
  const container = (global as any).__TESTCONTAINER__;
  if (container) {
    try {
      await container.stop();
    } catch (error) {
      console.error('Error stopping test container:', error);
    }
  }
};
