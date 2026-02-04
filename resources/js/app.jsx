import '../css/app.css';
import './bootstrap';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@/Contexts/ThemeContext';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.jsx`,
            import.meta.glob('./Pages/**/*.jsx'),
        ).then((module) => {
            const Page = module.default;
            return (props) => (
                <ThemeProvider>
                    <Page {...props} />
                </ThemeProvider>
            );
        }),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(<App {...props} />);
    },
    progress: {
        color: '#059669',
    },
    defaults: {
        visitOptions: (href, options) => {
            const currentPath = window.location.pathname;
            const targetPath = new URL(href, window.location.origin).pathname;
            const isSamePage = currentPath === targetPath;

            return {
                ...options,
                viewTransition: options.viewTransition ?? !isSamePage,
            };
        },
    },
});
