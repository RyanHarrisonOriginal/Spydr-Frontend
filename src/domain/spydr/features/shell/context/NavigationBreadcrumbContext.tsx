import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  getDefaultBreadcrumbLabel,
  WORKSPACE_ROOT_PATHS,
  type NavigationBreadcrumb,
} from "../utils/navigationBreadcrumbs";

interface NavigationBreadcrumbContextValue {
  stack: NavigationBreadcrumb[];
  setCurrentLabel(label: string): void;
}

const NavigationBreadcrumbContext =
  createContext<NavigationBreadcrumbContextValue | null>(null);

export function NavigationBreadcrumbProvider({ children }: { children: ReactNode }) {
  const { pathname, search } = useLocation();
  const [stack, setStack] = useState<NavigationBreadcrumb[]>([]);

  useEffect(() => {
    const defaultLabel = getDefaultBreadcrumbLabel(pathname);

    setStack((current) => {
      const existingIndex = current.findIndex(
        (entry) => entry.pathname === pathname && entry.search === search
      );

      if (existingIndex >= 0) {
        return current.slice(0, existingIndex + 1);
      }

      if (WORKSPACE_ROOT_PATHS.has(pathname)) {
        return [{ pathname, search, label: defaultLabel }];
      }

      if (current.length === 0) {
        return [{ pathname, search, label: defaultLabel }];
      }

      return [...current, { pathname, search, label: defaultLabel }];
    });
  }, [pathname, search]);

  const setCurrentLabel = useCallback(
    (label: string) => {
      const trimmed = label.trim();
      if (!trimmed) return;

      setStack((current) => {
        if (current.length === 0) return current;

        const lastIndex = current.length - 1;
        const last = current[lastIndex];
        if (last.pathname !== pathname || last.search !== search) {
          return current;
        }
        if (last.label === trimmed) {
          return current;
        }

        const next = [...current];
        next[lastIndex] = { ...last, label: trimmed };
        return next;
      });
    },
    [pathname, search]
  );

  const value = useMemo(
    () => ({
      stack,
      setCurrentLabel,
    }),
    [stack, setCurrentLabel]
  );

  return (
    <NavigationBreadcrumbContext.Provider value={value}>
      {children}
    </NavigationBreadcrumbContext.Provider>
  );
}

export function useNavigationBreadcrumbs() {
  const context = useContext(NavigationBreadcrumbContext);
  if (!context) {
    throw new Error("useNavigationBreadcrumbs must be used within NavigationBreadcrumbProvider");
  }
  return context;
}

export function usePageBreadcrumb(label: string) {
  const { setCurrentLabel } = useNavigationBreadcrumbs();

  useEffect(() => {
    setCurrentLabel(label);
  }, [label, setCurrentLabel]);
}
