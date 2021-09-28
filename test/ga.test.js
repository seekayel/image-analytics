const {track} = require('../app')

describe('ga test', () => {
  test('ga track', async () => {
    await expect(track('123','localhost','/test/ga.test.js')).resolves.toBe('peanut butter');
  });
})


