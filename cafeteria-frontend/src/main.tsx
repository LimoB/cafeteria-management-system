import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';

// Import your Redux store
import { store } from './app/store';

// Global styles (Tailwind layers)
import './index.css';

import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* 1. Provide the Redux store to the entire app */}
    <Provider store={store}>
      {/* Note: BrowserRouter was moved inside App.jsx to handle 
          global components like <Toaster /> and <Navbar /> better.
      */}
      <App />
    </Provider>
  </StrictMode>,
);