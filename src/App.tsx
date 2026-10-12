import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MobileAppContainer } from './components/mobile/MobileAppContainer';
import { AppRoutes } from './app/routes/AppRoutes';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <MobileAppContainer>
            <AppRoutes />
          </MobileAppContainer>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
