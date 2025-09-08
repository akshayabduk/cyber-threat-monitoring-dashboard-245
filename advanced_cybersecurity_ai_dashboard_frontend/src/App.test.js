import { render, screen } from '@testing-library/react';
import App from './App';

test('renders sign in screen initially', () => {
  render(<App />);
  expect(screen.getByText(/Sign in/i)).toBeInTheDocument();
});
