import { render, screen, act } from '@testing-library/react'
import SubmitterView from '../SubmitterView'
import { UserContext } from '../UserContext'
import React from 'react'
import { vi } from 'vitest'

describe('SubmitterView', () => {
  const mockSubmitter = { id: '1', name: 'Chenwei Wu', role: 'submitter' }

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve([
          {
            id: '456',
            title: 'Run Cell Diagnostics',
            description: 'Collect internal resistance data',
            status: 'pending',
            creatorName: 'Chenwei Wu',
            createdAt: new Date().toISOString()
          }
        ])
      })
    ))
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('submitter sees their tasks', async () => {
    await act(async () => {
      render(
        <UserContext.Provider value={{ user: mockSubmitter }}>
          <SubmitterView />
        </UserContext.Provider>
      )
    })

    expect(await screen.findByText(/Run Cell Diagnostics/i)).toBeInTheDocument()
    expect(screen.getByText(/Collect internal resistance data/i)).toBeInTheDocument()
  })

  test('submitter does not see approve/reject buttons', async () => {
    await act(async () => {
      render(
        <UserContext.Provider value={{ user: mockSubmitter }}>
          <SubmitterView />
        </UserContext.Provider>
      )
    })

    expect(screen.queryByText(/^approve$/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/^reject$/i)).not.toBeInTheDocument()
  })
})
