const substrate = require('../');

substrate.setNodeUri(['ws://192.168.1.240:8082']);

describe('staking', () => {
  async function getRuntimeStaking() {
    await substrate.runtimePromise();
    return substrate.runtime.staking;
  }

  test('intentionProfiles', async done => {
    const staking = await getRuntimeStaking();
    staking.intentionProfiles('5GoKvZWG5ZPYL1WUovuHW3zJBWBP5eT8CbqjdRY4Q6iMaDtZ').then(data => {
      console.log(data);
      // expect(data).toBe('')
      // done(data);
    });
  });
});
