import { render, screen, act } from '@testing-library/react'
import Navbar from '@/components/ui/Navbar'

jest.useFakeTimers()

const NAV_ITEMS = ['HOME', 'ABOUT', 'WORKS', 'SERVICES', 'EXPERIENCE']

describe('Navbar', () => {
  it('renders all nav items', () => {
    render(<Navbar />)
    NAV_ITEMS.forEach(item => {
      expect(screen.getByText(item)).toBeInTheDocument()
    })
  })

  it('renders Email me button with mailto link', () => {
    render(<Navbar />)
    const btn = screen.getByRole('link', { name: /email me/i })
    expect(btn).toHaveAttribute('href', 'mailto:vaibhavkhush124@gmail.com')
  })

  it('renders INDIA TIME label', () => {
    render(<Navbar />)
    expect(screen.getByText(/INDIA TIME/i)).toBeInTheDocument()
  })

  it('updates clock every second', () => {
    render(<Navbar />)
    act(() => jest.advanceTimersByTime(1000))
    expect(screen.getByText(/INDIA TIME/i)).toBeInTheDocument()
  })
})
