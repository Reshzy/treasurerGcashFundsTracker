import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import axios from 'axios';

const ThemeContext = createContext(null);

function getResolvedTheme(theme) {
    if (theme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    }
    return theme;
}

function applyTheme(resolved) {
    if (resolved === 'dark') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
}

export function ThemeProvider({ children }) {
    const { props } = usePage();
    const serverTheme = props.theme ?? null;

    const [theme, setThemeState] = useState(() => {
        const stored = serverTheme ?? localStorage.getItem('theme') ?? 'system';
        return stored;
    });

    const resolvedTheme = getResolvedTheme(theme);

    useEffect(() => {
        applyTheme(resolvedTheme);
    }, [resolvedTheme]);

    useEffect(() => {
        if (serverTheme != null) {
            setThemeState(serverTheme);
        }
    }, [serverTheme]);

    useEffect(() => {
        if (theme !== 'system') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = () => applyTheme(getResolvedTheme('system'));
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, [theme]);

    const setTheme = useCallback(
        (newTheme) => {
            const prefersReducedMotion = window.matchMedia(
                '(prefers-reduced-motion: reduce)'
            ).matches;

            const performUpdate = () => {
                setThemeState(newTheme);
                const resolved = getResolvedTheme(newTheme);
                applyTheme(resolved);
                localStorage.setItem('theme', newTheme);

                if (props.auth?.user) {
                    axios
                        .patch(route('profile.theme.update'), { theme: newTheme })
                        .catch(() => {});
                }
            };

            if (
                !prefersReducedMotion &&
                typeof document.startViewTransition === 'function'
            ) {
                document.startViewTransition({
                    update: performUpdate,
                    types: ['theme'],
                });
            } else {
                performUpdate();
            }
        },
        [props.auth?.user]
    );

    const toggleTheme = useCallback(() => {
        const next =
            resolvedTheme === 'light'
                ? 'dark'
                : 'light';
        setTheme(next);
    }, [resolvedTheme, setTheme]);

    return (
        <ThemeContext.Provider
            value={{
                theme,
                resolvedTheme,
                setTheme,
                toggleTheme,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
