import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ThemeProvider, useTheme } from '../ThemeContext';

// Mock matchMedia
const createMockMatchMedia = (matches: boolean) => {
  return (query: string) => ({
    matches,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  });
};

const TestComponent = () => {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
};

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    // Mock matchMedia to false by default
    window.matchMedia = vi.fn().mockImplementation(createMockMatchMedia(false));
  });

  it('provides default system theme and sets html class', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('system');
    expect(document.documentElement.classList.contains('light')).toBe(true);
  });

  it('provides system dark theme if prefers-color-scheme is dark', () => {
    window.matchMedia = vi.fn().mockImplementation(createMockMatchMedia(true));
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('system');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('changes theme manually and updates document classes and localStorage', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    );

    fireEvent.click(screen.getByText('Dark'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('resumesh-theme')).toBe('dark');

    fireEvent.click(screen.getByText('Light'));
    expect(screen.getByTestId('theme').textContent).toBe('light');
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(localStorage.getItem('resumesh-theme')).toBe('light');
  });
});
