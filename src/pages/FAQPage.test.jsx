import { render, screen } from '@testing-library/react';
import FAQPage from './FAQPage';

// Mock Header and Footer
vi.mock('../components/sections/Header/Header', () => ({
  default: () => <header data-testid="mock-header" />
}));

vi.mock('../components/sections/Footer/Footer', () => ({
  default: () => <footer data-testid="mock-footer" />
}));

describe('FAQPage', () => {
  it('renders FAQ section and all questions', () => {
    render(<FAQPage />);

    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-footer')).toBeInTheDocument();

    expect(screen.getByText('Frequently Asked')).toBeInTheDocument();
    
    // Check if the specific FAQs are rendered
    expect(screen.getByText('What is Vedic Astrology?')).toBeInTheDocument();
    expect(screen.getByText('How can astrology help me?')).toBeInTheDocument();
    expect(screen.getByText('Are consultations strictly confidential?')).toBeInTheDocument();
    expect(screen.getByText('How do I book an appointment?')).toBeInTheDocument();
  });
});
