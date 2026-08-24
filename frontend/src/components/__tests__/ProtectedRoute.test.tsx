import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../context/AuthContext';

// Mock react-router-dom Navigate
vi.mock('react-router-dom', () => ({
  Navigate: vi.fn(({ to }) => <div data-testid="navigate">Redirected to {to}</div>),
}));

// Mock useAuth
vi.mock('../../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

describe('ProtectedRoute Component', () => {
  it('renders children when authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      token: 'test-token',
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: true,
    });

    render(
      <ProtectedRoute>
        <div>Protected Area</div>
      </ProtectedRoute>
    );

    expect(screen.getByText('Protected Area')).toBeInTheDocument();
    expect(screen.queryByTestId('navigate')).toBeNull();
  });

  it('redirects to /admin/login when not authenticated', () => {
    vi.mocked(useAuth).mockReturnValue({
      token: null,
      login: vi.fn(),
      logout: vi.fn(),
      isAuthenticated: false,
    });

    render(
      <ProtectedRoute>
        <div>Protected Area</div>
      </ProtectedRoute>
    );

    expect(screen.queryByText('Protected Area')).toBeNull();
    expect(screen.getByTestId('navigate')).toBeInTheDocument();
    expect(screen.getByText('Redirected to /admin/login')).toBeInTheDocument();
  });
});
