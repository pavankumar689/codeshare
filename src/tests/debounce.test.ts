import { describe, it, expect, vi } from 'vitest'
import { debounce } from '../utils/debounce'

describe('debounce utility', () => {
  it('delays execution until specified wait time elapses', async () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced('first')
    expect(fn).not.toHaveBeenCalled()

    debounced('second')
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(199)
    expect(fn).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('second')

    vi.useRealTimers()
  })

  it('cancels scheduled execution on cancel()', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced('call')
    debounced.cancel()

    vi.advanceTimersByTime(300)
    expect(fn).not.toHaveBeenCalled()

    vi.useRealTimers()
  })

  it('flushes pending execution immediately on flush()', () => {
    vi.useFakeTimers()
    const fn = vi.fn()
    const debounced = debounce(fn, 200)

    debounced('immediate')
    expect(fn).not.toHaveBeenCalled()

    debounced.flush()
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('immediate')

    vi.useRealTimers()
  })
})
