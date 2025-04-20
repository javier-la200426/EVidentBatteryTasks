// TaskForm.test.jsx
import { render, screen } from '@testing-library/react'
import TaskForm from '../TaskForm'
import { UserContext } from '../UserContext' 
import React from 'react'
import { vi } from 'vitest'

test('TaskForm shows input and submit button', () => {
  const mockUser = { id: '1', name: 'Chenwei Wu', role: 'submitter' }

  render(
    <UserContext.Provider value={{ user: mockUser }}>
      <TaskForm />
    </UserContext.Provider>
  )

  expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument()
  expect(screen.getByText(/create task/i)).toBeInTheDocument()
})

test('TaskForm prevents submission when title is empty', async () => {
  const mockUser = { id: '1', name: 'Chenwei Wu', role: 'submitter' }
  const mockSubmit = vi.fn()

  render(
    <UserContext.Provider value={{ user: mockUser }}>
      <TaskForm onTaskCreated={mockSubmit} />
    </UserContext.Provider>
  )

  const button = screen.getByRole('button', { name: /create task/i })
  button.click()

  expect(mockSubmit).not.toHaveBeenCalled()
})
