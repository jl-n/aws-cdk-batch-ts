import { describe, it, expect } from 'vitest'

import { processData } from '../process'

describe('process', () => {
  it('Should process data', async () => {
    const processed = await processData({ data: '', log: (() => {}) as any })
    expect(processed.length).toBeGreaterThan(0)
  })
})
