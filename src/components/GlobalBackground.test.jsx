import { render } from '@testing-library/react';
import GlobalBackground from './GlobalBackground';

describe('GlobalBackground Component', () => {
  it('renders a canvas element without throwing', () => {
    const { container } = render(<GlobalBackground />);
    const canvas = container.querySelector('canvas#global-canvas');
    expect(canvas).toBeInTheDocument();
    expect(canvas).toHaveClass('fixed top-0 left-0');
  });
});
