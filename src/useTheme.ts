import { useEffect, useState } from 'react';

type ThemeChoice = 'light' | 'dark' | null;

const KEY = 'tiny-apps-theme';

function readStored(): ThemeChoice {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'light' || v === 'dark' ? v : null;
  } catch {
    return null;
  }
}

function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export function useTheme() {
  const [choice, setChoice] = useState<ThemeChoice>(readStored);

  useEffect(() => {
    if (choice) document.documentElement.setAttribute('data-theme', choice);
    else document.documentElement.removeAttribute('data-theme');
  }, [choice]);

  const toggle = () => {
    const current = choice ?? (systemPrefersDark() ? 'dark' : 'light');
    const next: ThemeChoice = current === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // ignore — private browsing or storage disabled
    }
    setChoice(next);
  };

  const effective: 'light' | 'dark' = choice ?? (systemPrefersDark() ? 'dark' : 'light');

  return { effective, toggle };
}
