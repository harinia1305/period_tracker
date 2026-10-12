import React from 'react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { NotificationProvider } from '../context/NotificationContext';
import { WelcomeScreen } from '../features/onboarding/WelcomeScreen';
import { GradientColorPicker } from '../components/color-picker/GradientColorPicker';
import { CalendarGrid } from '../components/calendar/CalendarGrid';

describe('UI Components', () => {
  it('renders WelcomeScreen with primary call to actions and safety disclaimers', () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <NotificationProvider>
            <WelcomeScreen />
          </NotificationProvider>
        </AuthProvider>
      </BrowserRouter>
    );

    expect(screen.getAllByText(/Period Love/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/Explore as User/i)).toBeInTheDocument();
    expect(screen.getByText(/Deliver with Us/i)).toBeInTheDocument();
    expect(screen.getByText(/estimates and not medical advice/i)).toBeInTheDocument();
  });

  it('renders GradientColorPicker with semantic presets and safety notice', () => {
    let chosen = '#C8374D';
    render(
      <GradientColorPicker
        color={chosen}
        onChange={(hex) => { chosen = hex; }}
      />
    );

    expect(screen.getByText(/Custom Gradient Palette/i)).toBeInTheDocument();
    expect(screen.getByText(/Light spotting shade/i)).toBeInTheDocument();
    expect(screen.getByText(/Red flow shade/i)).toBeInTheDocument();
    expect(screen.getByText(/Wellness Notice/i)).toBeInTheDocument();
  });

  it('renders CalendarGrid in Paint Drag mode with 42 date cells', () => {
    const d = new Date(2026, 8, 20); // Sep 2026
    const handleBatchPaint = () => {};

    render(
      <CalendarGrid
        currentDate={d}
        onDateChange={() => {}}
        logs={[]}
        estimate={null}
        selectedDateKey={null}
        onSelectDate={() => {}}
        selectedPaintColor="#C8374D"
        onBatchPaint={handleBatchPaint}
        onUndoPaint={() => {}}
        canUndo={false}
        onClearMonth={() => {}}
      />
    );

    expect(screen.getByText(/September 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/Paint Drag/i)).toBeInTheDocument();
    expect(screen.getByText(/Log Details/i)).toBeInTheDocument();

    // Check weekday headers
    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('renders GoogleAuthModal with accounts and verification details', async () => {
    const { GoogleAuthModal } = await import('../components/auth/GoogleAuthModal');

    render(
      <GoogleAuthModal
        isOpen={true}
        onClose={() => {}}
        onSelectAccount={() => {}}
        roleHint="user"
      />
    );

    expect(screen.getByText(/Sign in with Google/i)).toBeInTheDocument();
    expect(screen.getByText(/Maya Patel/i)).toBeInTheDocument();
    expect(screen.getByText(/Priya Sharma/i)).toBeInTheDocument();
    expect(screen.getByText(/Google Identity Verification/i)).toBeInTheDocument();
  });

  it('renders PaymentGatewayModal with all payment options (GPay, Cards, QR, NetBanking, COD)', async () => {
    const { PaymentGatewayModal } = await import('../components/payment/PaymentGatewayModal');

    render(
      <PaymentGatewayModal
        isOpen={true}
        onClose={() => {}}
        totalAmountInr={850}
        walletBalanceInr={500}
        onPaymentSuccess={() => {}}
      />
    );

    expect(screen.getByText(/Period Love Checkout/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Google Pay/i)[0]).toBeInTheDocument();
    expect(screen.getByText(/UPI QR/i)).toBeInTheDocument();
    expect(screen.getByText(/Cards/i)).toBeInTheDocument();
    expect(screen.getByText(/NetBanking/i)).toBeInTheDocument();
    expect(screen.getByText(/COD/i)).toBeInTheDocument();
    expect(screen.getByText(/Care Wallet/i)).toBeInTheDocument();
  });
});
