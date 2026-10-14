import { describe, it, expect } from 'vitest'

interface SimulationState {
  version: number
  content: string
  hasPendingEdits: boolean
}

function processIncomingRemoteUpdate(
  current: SimulationState,
  remote: { version: number; content: string }
): {
  action: 'ignore' | 'apply' | 'conflict'
  nextState: SimulationState
} {
  // Outdated or duplicate revision
  if (remote.version <= current.version) {
    return { action: 'ignore', nextState: current }
  }

  // Conflict if user has uncommitted local edits and content differs
  if (current.hasPendingEdits && current.content !== remote.content) {
    return {
      action: 'conflict',
      nextState: current,
    }
  }

  // Smoothly apply remote update
  return {
    action: 'apply',
    nextState: {
      version: remote.version,
      content: remote.content,
      hasPendingEdits: false,
    },
  }
}

describe('concurrency and synchronization resolution logic', () => {
  it('smoothly applies newer remote update when no local edits are pending', () => {
    const local: SimulationState = {
      version: 1,
      content: 'Initial code',
      hasPendingEdits: false,
    }

    const res = processIncomingRemoteUpdate(local, {
      version: 2,
      content: 'Updated code from laptop',
    })

    expect(res.action).toBe('apply')
    expect(res.nextState.version).toBe(2)
    expect(res.nextState.content).toBe('Updated code from laptop')
  })

  it('ignores stale or duplicate remote updates', () => {
    const local: SimulationState = {
      version: 5,
      content: 'Current version 5',
      hasPendingEdits: false,
    }

    // Stale update (e.g. from network latency or duplicate event)
    const res = processIncomingRemoteUpdate(local, {
      version: 4,
      content: 'Old version 4',
    })

    expect(res.action).toBe('ignore')
    expect(res.nextState.version).toBe(5)
    expect(res.nextState.content).toBe('Current version 5')
  })

  it('detects concurrency conflict when local user is actively typing different content', () => {
    const local: SimulationState = {
      version: 2,
      content: 'Local user typing something new',
      hasPendingEdits: true,
    }

    const res = processIncomingRemoteUpdate(local, {
      version: 3,
      content: 'Remote user pasted JSON config',
    })

    expect(res.action).toBe('conflict')
    // Does not wipe local user's unsaved edits
    expect(res.nextState.content).toBe('Local user typing something new')
  })

  it('avoids conflict if content matches even if version differed', () => {
    const local: SimulationState = {
      version: 2,
      content: 'Identical code snippet',
      hasPendingEdits: true,
    }

    const res = processIncomingRemoteUpdate(local, {
      version: 3,
      content: 'Identical code snippet',
    })

    expect(res.action).toBe('apply')
    expect(res.nextState.version).toBe(3)
  })
})
