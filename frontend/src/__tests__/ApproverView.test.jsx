import { render, screen } from '@testing-library/react'
import ApproverView from '../ApproverView'
import { UserContext } from '../UserContext'
import React from 'react'
import { vi } from 'vitest'

test('approver can see approve/reject buttons for pending tasks', async () => {
  vi.stubGlobal('fetch', vi.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve([
        {
          id: '123',
          title: 'Battery Inspection',
          description: 'Run vibration analysis',
          status: 'pending',
          creatorName: 'Test User',
          createdAt: new Date().toISOString()
        }
      ])
    })
  ))

  const mockApprover = { id: '2', name: 'Alice', role: 'approver' }

  render(
    <UserContext.Provider value={{ user: mockApprover }}>
      <ApproverView />
    </UserContext.Provider>
  )

  expect(await screen.findByText(/Battery Inspection/)).toBeInTheDocument()

  const approveButtons = screen.getAllByRole('button', { name: /approve/i })
  const rejectButtons = screen.getAllByRole('button', { name: /reject/i })

  expect(approveButtons.length).toBeGreaterThan(0)
  expect(rejectButtons.length).toBeGreaterThan(0)

  vi.restoreAllMocks()
})
