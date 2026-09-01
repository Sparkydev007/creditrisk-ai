import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from '../App.jsx';

describe('App Component', () => {
  test('renders login page when not authenticated', () => {
    localStorage.clear();
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/CreditRisk AI/i)).toBeTruthy();
  });

  test('renders login form', () => {
    localStorage.clear();
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
    expect(screen.getByText(/Sign in/i)).toBeTruthy();
  });
});
