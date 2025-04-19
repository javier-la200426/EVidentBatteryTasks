import { render, screen } from '@testing-library/react'
import TaskForm from '../TaskForm'
import { UserContext } from '../UserContext' 
import React from 'react'

test('TaskForm shows input and submit button', () => {
  const mockUser = { id: '1', name: 'Alice', role: 'submitter' }

  render(
    <UserContext.Provider value={{ user: mockUser }}>
      <TaskForm />
    </UserContext.Provider>
  )

  expect(screen.getByPlaceholderText(/title/i)).toBeInTheDocument()
  expect(screen.getByText(/add task/i)).toBeInTheDocument()
})
