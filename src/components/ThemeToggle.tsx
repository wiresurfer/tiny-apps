import React from 'react';
import { useTheme } from '../useTheme';

export default function ThemeToggle() {
  const { effective, toggle } = useTheme();
  return (
    <button className="tt-toggle" onClick={toggle} aria-label="Toggle light/dark theme" title="Toggle light/dark theme">
      {effective === 'dark' ? '☀' : '☾'}
    </button>
  );
}
