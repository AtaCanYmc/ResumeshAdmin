import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import EmptyState from '../EmptyState';
import { Briefcase } from 'lucide-react';

describe('EmptyState Component', () => {
  it('renders title and message correctly', () => {
    render(
      <EmptyState
        icon={Briefcase}
        title="Test Title"
        message="Test Message"
      />
    );

    expect(screen.getByText('Test Title')).toBeInTheDocument();
    expect(screen.getByText('Test Message')).toBeInTheDocument();
  });

  it('renders action button and triggers onAction callback on click', () => {
    const handleAction = vi.fn();
    render(
      <EmptyState
        icon={Briefcase}
        title="Test Title"
        message="Test Message"
        actionLabel="Click Me"
        onAction={handleAction}
      />
    );

    const button = screen.getByRole('button', { name: 'Click Me' });
    expect(button).toBeInTheDocument();
    fireEvent.click(button);
    expect(handleAction).toHaveBeenCalledTimes(1);
  });
});
