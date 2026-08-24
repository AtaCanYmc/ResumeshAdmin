import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { AuthProvider, useAuth } from '../AuthContext';

const TestComponent = () => {
  const { token, login, logout, isAuthenticated } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'Auth' : 'NoAuth'}</span>
      <span data-testid="token">{token || 'NoToken'}</span>
      <button onClick={() => login('test-token')}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('provides default unauthenticated state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('NoAuth');
    expect(screen.getByTestId('token').textContent).toBe('NoToken');
  });

  it('signs in correctly and stores token in localStorage', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    fireEvent.click(screen.getByText('Login'));

    expect(screen.getByTestId('auth-status').textContent).toBe('Auth');
    expect(screen.getByTestId('token').textContent).toBe('test-token');
    expect(localStorage.getItem('isLoggedIn')).toBe('true');
  });

  it('signs out correctly and removes token from localStorage', () => {
    localStorage.setItem('isLoggedIn', 'true');
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('auth-status').textContent).toBe('Auth');

    fireEvent.click(screen.getByText('Logout'));

    expect(screen.getByTestId('auth-status').textContent).toBe('NoAuth');
    expect(screen.getByTestId('token').textContent).toBe('NoToken');
    expect(localStorage.getItem('isLoggedIn')).toBeNull();
  });
});
