import { render, screen } from '@testing-library/react';
import Home from './Home';

// Mock Header and Footer and complex sections
vi.mock('../components/sections/Header/Header', () => ({ default: () => <header data-testid="mock-header" /> }));
vi.mock('../components/sections/Footer/Footer', () => ({ default: () => <footer data-testid="mock-footer" /> }));
vi.mock('../components/sections/Hero/Hero', () => ({ default: () => <section data-testid="mock-hero" /> }));
vi.mock('../components/sections/Courses/CourseSection', () => ({ default: () => <section data-testid="mock-course" /> }));
vi.mock('../components/sections/Article/ArticleSection', () => ({ default: () => <section data-testid="mock-article" /> }));
vi.mock('../components/sections/About/About', () => ({ default: () => <section data-testid="mock-about" /> }));
vi.mock('../components/sections/Horoscope/Horoscope', () => ({ default: () => <section data-testid="mock-horoscope" /> }));
vi.mock('../components/sections/Numerology/Numerology', () => ({ default: () => <section data-testid="mock-numerology" /> }));
vi.mock('../components/sections/Testimonials/Testimonials', () => ({ default: () => <section data-testid="mock-testimonials" /> }));
vi.mock('../components/sections/Partners/Partners', () => ({ default: () => <section data-testid="mock-partners" /> }));
vi.mock('../components/sections/Contact/Contact', () => ({ default: () => <section data-testid="mock-contact" /> }));

describe('HomePage', () => {
  it('renders critical components eagerly and lazy components with Suspense', async () => {
    render(<Home />);

    // Eagerly loaded components
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-hero')).toBeInTheDocument();
    expect(screen.getByTestId('mock-course')).toBeInTheDocument();

    // Lazy components should eventually render (we mock them to render instantly for testing, but in a real scenario we'd use waitFor)
    expect(await screen.findByTestId('mock-article')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-about')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-horoscope')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-numerology')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-testimonials')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-partners')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-contact')).toBeInTheDocument();
    expect(await screen.findByTestId('mock-footer')).toBeInTheDocument();
  });
});
