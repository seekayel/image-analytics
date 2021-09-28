const {track} = require('../app')

describe('ga test', () => {
  test('ga track', async () => {
    let res = await track('123','localhost','/test/ga.test.js')
    console.log(res)
  });
})


