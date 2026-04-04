import { useEffect, useState } from 'react';

const THEME_STORAGE_KEY = 'app_theme';
export const THEME_CHANGE_EVENT = 'appThemeChange';

const getSystemTheme = () => {
    if (typeof window === 'undefined' || !window.matchMedia) return 'dark';
    return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
};

export const getCurrentTheme = () => {
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY);
    return savedTheme === 'light' || savedTheme === 'dark'
        ? savedTheme
        : getSystemTheme();
};

export const applyTheme = (theme) => {
    document.documentElement.setAttribute('data-theme', theme);
    document.documentElement.style.colorScheme = theme;
};

export const setTheme = (theme) => {
    if (theme !== 'light' && theme !== 'dark') return false;
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    applyTheme(theme);
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: theme }));
    return true;
};

export const toggleTheme = () => {
    const nextTheme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    return nextTheme;
};

export const initTheme = () => {
    applyTheme(getCurrentTheme());
};

export const useTheme = () => {
    const [theme, setThemeState] = useState(getCurrentTheme());

    useEffect(() => {
        applyTheme(getCurrentTheme());
        const handleThemeChange = (e) => {
            setThemeState(e.detail);
        };
        window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);
        return () => window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
    }, []);

    return { theme, setTheme, toggleTheme };
};
