import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import NotFoundPage from './NotFoundPage';

// Mock Header and Footer as they might have complex dependencies
vi.mock('../components/sections/Header/Header', () => ({
  default: () => <header data-testid="mock-header" />
}));

vi.mock('../components/sections/Footer/Footer', () => ({
  default: () => <footer data-testid="mock-footer" />
}));

describe('NotFoundPage', () => {
  it('renders the 404 page correctly', () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();
    
    expect(screen.getByText('404')).toBeInTheDocument();
    expect(screen.getByText('Lost in the Cosmos')).toBeInTheDocument();
    expect(screen.getByText(/The celestial body you are looking for has moved out of orbit/i)).toBeInTheDocument();
    
    const homeLink = screen.getByRole('link', { name: /Return Home/i });
    expect(homeLink).toBeInTheDocument();
    expect(homeLink).toHaveAttribute('href', '/');
  });
});
