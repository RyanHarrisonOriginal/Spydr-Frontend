/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
  readonly VITE_CLERK_PUBLISHABLE_KEY?: string;
  readonly VITE_USE_ACTIVE_NOTE_MOCKS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
