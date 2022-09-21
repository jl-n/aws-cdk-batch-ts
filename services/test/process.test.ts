import { describe, it, expect } from 'vitest'
import phin from 'phin'

import { processData } from '../process'

describe('process', () => {
  it('Should correctly process data', async () => {
    const process = processData({
      data: '',
      log: (x) => console.log(x) as any,
    })

    expect(process)
  })
})
