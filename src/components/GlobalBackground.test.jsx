import { render } from '@testing-library/react';
import GlobalBackground from './GlobalBackground';
import { vi } from 'vitest';

// Mock the hook to prevent canvas manipulation errors in jsdom
vi.mock('../hooks/useParticles', () => ({
  default: vi.fn(),
}));

describe('GlobalBackground Component', () => {
  it('renders a canvas element', () => {
    const { container } = render(<GlobalBackground />);
    const canvas = container.querySelector('canvas#global-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('fixed top-0 left-0');
  });
});
