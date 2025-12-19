// src/main.jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import './styles/main.css';
import App from './components/App.jsx'; // ← Убедитесь, что путь правильный!

const root = createRoot(document.getElementById('root'));
root.render(<App />);