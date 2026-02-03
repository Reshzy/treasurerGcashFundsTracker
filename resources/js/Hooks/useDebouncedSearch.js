import { useCallback, useEffect, useRef, useState } from 'react';
import { router } from '@inertiajs/react';

export default function useDebouncedSearch(routeName, routeParams = {}, initialSearch = '', delay = 300) {
    const [search, setSearch] = useState(initialSearch);
    const timeoutRef = useRef(null);

    useEffect(() => {
        setSearch(initialSearch);
    }, [initialSearch]);

    const handleSearchChange = useCallback(
        (e) => {
            const value = e.target.value;
            setSearch(value);

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }

            timeoutRef.current = setTimeout(() => {
                const url = route(routeName, routeParams);
                router.get(url, { search: value || undefined }, {
                    replace: true,
                    preserveScroll: true,
                });
            }, delay);
        },
        [routeName, routeParams, delay],
    );

    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    return { search, setSearch, handleSearchChange };
}
