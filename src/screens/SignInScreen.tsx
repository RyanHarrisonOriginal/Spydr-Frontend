import { SignIn, useAuth } from "@clerk/react";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { SignalField } from "@/shared/brand/SignalField";
import { SpydrMark } from "@/shared/brand/SpydrMark";
import { signInAppearance } from "@/lib/clerkAppearance";
import { authRoutes } from "@/config/auth";
import { oauthNavigationTarget } from "@/lib/oauthConsent";
import "./sign-in-splash.css";

function oauthReturnUrl(search: string, hash: string): string | undefined {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const target = oauthNavigationTarget(search, hash, origin);
  if (target?.type === "consent") return target.to;
  if (target?.type === "external") return target.href;
  return undefined;
}

function appReturnUrl(search: string): string | undefined {
  const params = new URLSearchParams(search);
  const redirect = params.get("redirect_url");
  if (!redirect || !redirect.startsWith("/") || redirect.startsWith("//")) {
    return undefined;
  }
  return redirect;
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
}

export default function SignInScreen() {
  const location = useLocation();
  const { isLoaded, isSignedIn } = useAuth();
  const oauthReturn = oauthReturnUrl(location.search, location.hash);
  const appReturn = appReturnUrl(location.search);
  const afterSignIn = oauthReturn ?? appReturn ?? "/";
  const formRef = useRef<HTMLElement>(null);
  const [clerkMounted, setClerkMounted] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [reducedMotion] = useState(prefersReducedMotion);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !oauthReturn) return;
    if (oauthReturn.startsWith("http")) {
      window.location.replace(oauthReturn);
    }
  }, [isLoaded, isSignedIn, oauthReturn]);

  useEffect(() => {
    const root = formRef.current;
    if (!root) return;

    const check = () => {
      if (
        root.querySelector(
          ".cl-rootBox, .cl-card, [data-clerk-component], iframe",
        )
      ) {
        setClerkMounted(true);
      }
    };

    check();
    const observer = new MutationObserver(check);
    observer.observe(root, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (clerkMounted) {
      setShowTip(false);
      return;
    }
    const id = window.setTimeout(() => {
      setShowTip(true);
    }, 4000);
    return () => window.clearTimeout(id);
  }, [clerkMounted]);

  return (
    <div className="sign-in-splash">
      <SignalField static={reducedMotion} />

      <header className="sign-in-splash__header">
        <Link to="/" className="sign-in-splash__brand">
          <SpydrMark size={22} variant="compact" static decorative />
          <span className="sign-in-splash__brand-name">Spydr</span>
        </Link>
        <Link to="/sign-up" className="sign-in-splash__header-link">
          Create account
        </Link>
      </header>

      <main className="sign-in-splash__main">
        <section className="sign-in-splash__copy">
          <SpydrMark
            className="sign-in-splash__mark"
            size={104}
            intro={!reducedMotion}
            static={reducedMotion}
          />
          <h1 className="sign-in-splash__title">Back to the web</h1>
          <p className="sign-in-splash__lede">
            Every thread is exactly where you left it.
          </p>
        </section>

        <section
          ref={formRef}
          className="sign-in-splash__form"
          data-clerk-sign-in-container
        >
          <SignIn
            fallbackRedirectUrl={afterSignIn}
            forceRedirectUrl={oauthReturn}
            signUpUrl={authRoutes.signUpUrl}
            appearance={signInAppearance}
          />
        </section>
      </main>

      {showTip && !clerkMounted ? (
        <footer className="sign-in-splash__footer">
          Form not loading? Turn off strict tracking protection for this site.
        </footer>
      ) : null}
    </div>
  );
}
