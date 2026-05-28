const isProduction =
  (import.meta as { env?: { PROD?: boolean } }).env?.PROD ?? false;

export const authRoutes = {
  signInUrl: isProduction
    ? "https://accounts.spydr-app.cloud/sign-in"
    : "/sign-in",
  signUpUrl: isProduction
    ? "https://accounts.spydr-app.cloud/sign-up"
    : "/sign-up",
  afterSignOutUrl: "/",
};
