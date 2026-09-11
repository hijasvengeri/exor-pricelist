


"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";
import { logCustomerActivity } from "../../lib/customerActivity";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);
    const [errorMessage, setErrorMessage] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const checkExistingSession = async () => {
            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (session) {
                router.replace("/");
                return;
            }

            setCheckingSession(false);
        };

        checkExistingSession();
    }, [router]);

    const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        setErrorMessage("");

        const cleanEmail = email.trim().toLowerCase();

        if (!cleanEmail) {
            setErrorMessage("Please enter your email address.");
            return;
        }

        if (!password) {
            setErrorMessage("Please enter your password.");
            return;
        }

        try {
            setLoading(true);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: cleanEmail,
                password,
            });



            if (error) {
                console.error("Login error:", error);

                if (
                    error.message.toLowerCase().includes("email not confirmed")
                ) {
                    setErrorMessage(
                        "Please confirm your email address before logging in."
                    );
                } else {
                    setErrorMessage("Invalid email address or password.");
                }

                return;
            }

            if (!data.session) {
                setErrorMessage(
                    "Login was not completed. Please try again."
                );
                return;
            }


            await logCustomerActivity({
                actionType: "LOGIN",
                customerEmail: data.user.email ?? cleanEmail,
                details: {
                    method: "password",
                },
            });

            router.replace("/");
        } catch (error) {
            console.error("Login exception:", error);

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    if (checkingSession) {
        return (
            <>
                <style jsx>{`
          .loading-page {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background:
              radial-gradient(
                circle at top left,
                rgba(37, 99, 235, 0.08),
                transparent 35%
              ),
              #f7f9fc;
            color: #475569;
            font-family:
              Inter,
              -apple-system,
              BlinkMacSystemFont,
              "Segoe UI",
              sans-serif;
          }

          .loading-box {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 14px;
            font-weight: 500;
          }

          .spinner {
            width: 18px;
            height: 18px;
            border: 2px solid #dbe4f0;
            border-top-color: #2563eb;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>

                <main className="loading-page">
                    <div className="loading-box">
                        <span className="spinner" />
                        Checking login...
                    </div>
                </main>
            </>
        );
    }

    return (
        <>
            <style jsx>{`
        * {
          box-sizing: border-box;
        }

        .page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px 16px;
          background:
            radial-gradient(
              circle at top left,
              rgba(37, 99, 235, 0.08),
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(14, 165, 233, 0.07),
              transparent 35%
            ),
            #f7f9fc;
          font-family:
            Inter,
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            sans-serif;
        }

        .card {
          width: 100%;
          max-width: 470px;
          background: #ffffff;
          border: 1px solid #edf1f6;
          border-radius: 22px;
          padding: 38px 38px 32px;
          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.08),
            0 4px 14px rgba(15, 23, 42, 0.04);
        }

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 28px;
        }

        .brand-mark {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #0ea5e9
          );
          color: white;
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.8px;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.22);
          margin-bottom: 12px;
        }

        .brand-name {
          margin: 0;
          color: #0f172a;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.2px;
        }

        .brand-subtitle {
          margin: 3px 0 0;
          color: #94a3b8;
          font-size: 12px;
          font-weight: 500;
        }

        .heading {
          text-align: center;
          margin-bottom: 28px;
        }

        .heading h1 {
          margin: 0;
          color: #0f172a;
          font-size: 27px;
          line-height: 1.2;
          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .heading p {
          margin: 8px 0 0;
          color: #64748b;
          font-size: 14px;
          line-height: 1.5;
        }

        .field {
          margin-bottom: 18px;
        }

        .label {
          display: block;
          margin-bottom: 8px;
          color: #334155;
          font-size: 13px;
          font-weight: 650;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          top: 50%;
          transform: translateY(-50%);
          width: 18px;
          height: 18px;
          color: #94a3b8;
          pointer-events: none;
        }

        .input {
          width: 100%;
          height: 48px;
          padding: 0 14px 0 44px;
          border: 1px solid #dce3ec;
          border-radius: 12px;
          background: #ffffff;
          color: #0f172a;
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition:
            border-color 0.2s ease,
            box-shadow 0.2s ease,
            background 0.2s ease;
        }

        .input::placeholder {
          color: #a8b2c1;
        }

        .input:hover {
          border-color: #b9c6d6;
        }

        .input:focus {
          border-color: #2563eb;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.09);
        }

        .password-input {
          padding-right: 48px;
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 8px;
          background: transparent;
          color: #94a3b8;
          cursor: pointer;
          transition:
            background 0.2s ease,
            color 0.2s ease;
        }

        .password-toggle:hover {
          background: #f1f5f9;
          color: #475569;
        }

        .forgot-row {
          display: flex;
          justify-content: flex-end;
          margin-top: -4px;
          margin-bottom: 21px;
        }

        .forgot-link {
          color: #2563eb;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .forgot-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .error {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 18px;
          padding: 12px 13px;
          border: 1px solid #fecaca;
          border-radius: 11px;
          background: #fff5f5;
          color: #b42318;
          font-size: 13px;
          line-height: 1.45;
        }

        .error-icon {
          flex: 0 0 auto;
          width: 17px;
          height: 17px;
          margin-top: 1px;
        }

        .submit-button {
          width: 100%;
          height: 49px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(
            135deg,
            #2563eb,
            #0ea5e9
          );
          color: #ffffff;
          font-family: inherit;
          font-size: 14px;
          font-weight: 700;
          letter-spacing: 0.1px;
          cursor: pointer;
          box-shadow: 0 8px 20px rgba(37, 99, 235, 0.2);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 11px 25px rgba(37, 99, 235, 0.26);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          box-shadow: none;
        }

        .button-content {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
        }

        .button-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .register-row {
          text-align: center;
          margin-top: 23px;
          color: #64748b;
          font-size: 13px;
        }

        .register-link {
          color: #2563eb;
          font-weight: 700;
          text-decoration: none;
          margin-left: 3px;
        }

        .register-link:hover {
          color: #1d4ed8;
          text-decoration: underline;
        }

        .footer {
          margin-top: 27px;
          padding-top: 19px;
          border-top: 1px solid #eef2f6;
          text-align: center;
          color: #a0aabd;
          font-size: 11px;
          font-weight: 500;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 520px) {
          .page {
            padding: 20px 14px;
          }

          .card {
            padding: 30px 22px 25px;
            border-radius: 19px;
          }

          .heading h1 {
            font-size: 24px;
          }

          .brand {
            margin-bottom: 24px;
          }
        }
      `}</style>

            <main className="page">
                <div className="card">

                    {/* Brand */}
                    <div className="brand">
                        {/* <div className="brand-mark">EX</div> */}

                        <p className="brand-name">
                            EXOR Medical Systems
                        </p>

                        <p className="brand-subtitle">
                            Customer Portal
                        </p>
                    </div>

                    {/* Heading */}
                    <div className="heading">
                        <h1>Welcome back</h1>

                        <p>
                            Login to securely access our latest product price list.
                        </p>
                    </div>

                    <form onSubmit={handleLogin}>

                        {/* Email */}
                        <div className="field">
                            <label
                                htmlFor="email"
                                className="label"
                            >
                                Email Address
                            </label>

                            <div className="input-wrapper">

                                <svg
                                    className="input-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="3"
                                        y="5"
                                        width="18"
                                        height="14"
                                        rx="2"
                                    />
                                    <path d="m3 7 9 6 9-6" />
                                </svg>

                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    placeholder="Enter your email address"
                                    disabled={loading}
                                    autoComplete="email"
                                    className="input"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="field">
                            <label
                                htmlFor="password"
                                className="label"
                            >
                                Password
                            </label>

                            <div className="input-wrapper">

                                <svg
                                    className="input-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        x="4"
                                        y="10"
                                        width="16"
                                        height="11"
                                        rx="2"
                                    />

                                    <path d="M8 10V7a4 4 0 0 1 8 0v3" />

                                    <circle
                                        cx="12"
                                        cy="15.5"
                                        r="1"
                                    />
                                </svg>

                                <input
                                    id="password"
                                    type={
                                        showPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="Enter your password"
                                    disabled={loading}
                                    autoComplete="current-password"
                                    className="input password-input"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(
                                            !showPassword
                                        )
                                    }
                                    disabled={loading}
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M3 3l18 18" />
                                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                            <path d="M9.9 4.2A10.7 10.7 0 0 1 12 4c5 0 8.5 4 9.5 6-.4.8-1.3 2-2.7 3.1" />
                                            <path d="M6.2 6.2C4.4 7.4 3.2 9 2.5 10c1 2 4.5 6 9.5 6 1 0 1.9-.2 2.8-.5" />
                                        </svg>
                                    ) : (
                                        <svg
                                            width="18"
                                            height="18"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                                            <circle
                                                cx="12"
                                                cy="12"
                                                r="2.5"
                                            />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password */}
                        <div className="forgot-row">
                            <Link
                                href="/forgot-password"
                                className="forgot-link"
                            >
                                Forgot Password?
                            </Link>
                        </div>

                        {/* Error */}
                        {errorMessage && (
                            <div className="error">
                                <svg
                                    className="error-icon"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 8v4" />
                                    <path d="M12 16h.01" />
                                </svg>

                                <span>{errorMessage}</span>
                            </div>
                        )}

                        {/* Login Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="submit-button"
                        >
                            <span className="button-content">
                                {loading && (
                                    <span className="button-spinner" />
                                )}

                                {loading
                                    ? "Logging in..."
                                    : "Login to Customer Portal"}
                            </span>
                        </button>
                    </form>

                    {/* Register */}
                    <div className="register-row">
                        Don't have an account?

                        <Link
                            href="/register"
                            className="register-link"
                        >
                            Create Account
                        </Link>
                    </div>

                    {/* Footer */}
                    <div className="footer">
                        © {new Date().getFullYear()} EXOR Medical Systems
                    </div>

                </div>
            </main>
        </>
    );
}

