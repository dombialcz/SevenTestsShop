import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Toast from './Toast';

describe('Toast Component', () => {
  test('renders toast with message', () => {
    const onClose = jest.fn();
    render(<Toast message="Test message" onClose={onClose} />);

    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  test('renders success toast by default', () => {
    const onClose = jest.fn();
    render(<Toast message="Success!" onClose={onClose} />);

    const toast = screen.getByText('Success!').closest('.toast');
    expect(toast).toHaveClass('toast-success');
    expect(screen.getByText('✓')).toBeInTheDocument();
  });

  test('renders info toast when type is info', () => {
    const onClose = jest.fn();
    render(<Toast message="Info message" type="info" onClose={onClose} />);

    const toast = screen.getByText('Info message').closest('.toast');
    expect(toast).toHaveClass('toast-info');
    expect(screen.getByText('ℹ')).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    render(<Toast message="Click to close" onClose={onClose} />);

    const closeButton = screen.getByText('×');
    await user.click(closeButton);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  test('auto-dismisses after default duration (3000ms)', async () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    
    render(<Toast message="Auto dismiss" onClose={onClose} />);

    expect(onClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(3000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  test('auto-dismisses after custom duration', async () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    
    render(<Toast message="Custom duration" onClose={onClose} duration={1000} />);

    expect(onClose).not.toHaveBeenCalled();

    jest.advanceTimersByTime(1000);

    await waitFor(() => {
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    jest.useRealTimers();
  });

  test('cleans up timer on unmount', () => {
    jest.useFakeTimers();
    const onClose = jest.fn();
    
    const { unmount } = render(<Toast message="Unmount test" onClose={onClose} />);

    unmount();

    jest.advanceTimersByTime(3000);

    expect(onClose).not.toHaveBeenCalled();

    jest.useRealTimers();
  });
});
