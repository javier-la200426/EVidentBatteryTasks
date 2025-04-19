import { render, screen } from '@testing-library/react'
import ApproverView from '../ApproverView'
import { UserContext } from '../UserContext'
import React from 'react'

const mockSubmitter = { id: '1', name: 'Alice', role: 'submitter' }

test('submitter cannot see approve/reject buttons', async () => {
  render(
    <UserContext.Provider value={{ user: mockSubmitter }}>
      <ApproverView />
    </UserContext.Provider>
  )

  // Expect no Approve/Reject buttons for submitter role
  expect(screen.queryByText(/^approve$/i)).not.toBeInTheDocument()
  expect(screen.queryByText(/^reject$/i)).not.toBeInTheDocument()
})
