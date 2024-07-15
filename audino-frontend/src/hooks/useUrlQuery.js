
// A custom hook that builds on useLocation to parse

import { useMemo } from "react";
import { useLocation } from "react-router-dom";

// the query string for you.
export default function useUrlQuery() {
    const { search } = useLocation();

    return useMemo(() => new URLSearchParams(search), [search]);
}
