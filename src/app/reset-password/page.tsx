
"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ResetPasswordPage() {
    const router = useRouter();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] =
        useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] =
        useState(true);

    const [errorMessage, setErrorMessage] =
        useState("");
    const [successMessage, setSuccessMessage] =
        useState("");

    useEffect(() => {
        let mounted = true;

        const checkSession = async () => {
            try {
                const {
                    data: { session },
                } = await supabase.auth.getSession();

                if (!mounted) return;

                if (!session) {
                    setErrorMessage(
                        "This password reset link is invalid or has expired. Please request a new password reset link."
                    );
                }
            } catch (error) {
                console.error(
                    "Reset password session check error:",
                    error
                );

                if (mounted) {
                    setErrorMessage(
                        "Unable to verify the password reset link. Please request a new one."
                    );
                }
            } finally {
                if (mounted) {
                    setCheckingSession(false);
                }
            }
        };

        checkSession();

        return () => {
            mounted = false;
        };
    }, []);

    const handleResetPassword = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        if (!password) {
            setErrorMessage(
                "Please enter a new password."
            );
            return;
        }

        if (password.length < 6) {
            setErrorMessage(
                "Password must be at least 6 characters."
            );
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage(
                "Passwords do not match."
            );
            return;
        }

        try {
            setLoading(true);

            const { error } =
                await supabase.auth.updateUser({
                    password,
                });

            if (error) {
                console.error(
                    "Supabase password update error:",
                    error
                );

                setErrorMessage(error.message);
                return;
            }

            setPassword("");
            setConfirmPassword("");

            setSuccessMessage(
                "Your password has been changed successfully. Redirecting to login..."
            );

            await supabase.auth.signOut();

            setTimeout(() => {
                router.replace("/login");
            }, 2000);
        } catch (error) {
            console.error(
                "Reset password error:",
                error
            );

            setErrorMessage(
                error instanceof Error
                    ? error.message
                    : "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="reset-page">
            <div className="reset-card">

                {/* Brand */}
                <div className="brand-section">
                    <div className="brand-logo">
                        EX
                    </div>

                    <div className="brand-name">
                        EXOR Medical Systems
                    </div>

                    <div className="brand-portal">
                        Customer Portal
                    </div>
                </div>

                {/* Heading */}
                <div className="heading-section">
                    <h1>Set a new password</h1>

                    <p>
                        Create a new password for your
                        customer account.
                    </p>
                </div>

                {/* Checking session */}
                {checkingSession ? (
                    <div className="checking-box">
                        <div className="spinner" />
                        <span>
                            Verifying reset link...
                        </span>
                    </div>
                ) : (
                    <>
                        {/* Error */}
                        {errorMessage && (
                            <div className="message error-message">
                                <span className="message-icon">
                                    !
                                </span>

                                <span>
                                    {errorMessage}
                                </span>
                            </div>
                        )}

                        {/* Success */}
                        {successMessage && (
                            <div className="message success-message">
                                <span className="message-icon">
                                    ✓
                                </span>

                                <span>
                                    {successMessage}
                                </span>
                            </div>
                        )}

                        {/* Form */}
                        {!errorMessage &&
                            !successMessage && (
                                <form
                                    onSubmit={
                                        handleResetPassword
                                    }
                                    className="reset-form"
                                >
                                    {/* New Password */}
                                    <div className="field">
                                        <label htmlFor="password">
                                            New Password
                                        </label>

                                        <div className="input-wrapper">
                                            <span className="input-icon">
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="11"
                                                        width="18"
                                                        height="10"
                                                        rx="2"
                                                    />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </span>

                                            <input
                                                id="password"
                                                type={
                                                    showPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={password}
                                                onChange={(e) =>
                                                    setPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Minimum 6 characters"
                                                disabled={loading}
                                                autoComplete="new-password"
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
                                                        width="19"
                                                        height="19"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        width="19"
                                                        height="19"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M3 3l18 18" />
                                                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                        <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-3 4.2" />
                                                        <path d="M6.6 6.6C3.8 8.5 2 12 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.1-.8" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="field">
                                        <label htmlFor="confirmPassword">
                                            Confirm New Password
                                        </label>

                                        <div className="input-wrapper">
                                            <span className="input-icon">
                                                <svg
                                                    width="18"
                                                    height="18"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                >
                                                    <rect
                                                        x="3"
                                                        y="11"
                                                        width="18"
                                                        height="10"
                                                        rx="2"
                                                    />
                                                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                                </svg>
                                            </span>

                                            <input
                                                id="confirmPassword"
                                                type={
                                                    showConfirmPassword
                                                        ? "text"
                                                        : "password"
                                                }
                                                value={
                                                    confirmPassword
                                                }
                                                onChange={(e) =>
                                                    setConfirmPassword(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Re-enter your new password"
                                                disabled={loading}
                                                autoComplete="new-password"
                                            />

                                            <button
                                                type="button"
                                                className="password-toggle"
                                                onClick={() =>
                                                    setShowConfirmPassword(
                                                        !showConfirmPassword
                                                    )
                                                }
                                                disabled={loading}
                                                aria-label={
                                                    showConfirmPassword
                                                        ? "Hide password"
                                                        : "Show password"
                                                }
                                            >
                                                {showConfirmPassword ? (
                                                    <svg
                                                        width="19"
                                                        height="19"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                                                        <circle
                                                            cx="12"
                                                            cy="12"
                                                            r="3"
                                                        />
                                                    </svg>
                                                ) : (
                                                    <svg
                                                        width="19"
                                                        height="19"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2"
                                                    >
                                                        <path d="M3 3l18 18" />
                                                        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
                                                        <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 8 10 8a18.5 18.5 0 0 1-3 4.2" />
                                                        <path d="M6.6 6.6C3.8 8.5 2 12 2 12s3.5 7 10 7a10.9 10.9 0 0 0 4.1-.8" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Update Button */}
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="submit-button"
                                    >
                                        {loading ? (
                                            <>
                                                <span className="button-spinner" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                Update Password
                                                <span className="button-arrow">
                                                    →
                                                </span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                        {/* Login */}
                        <div className="login-link">
                            <span>
                                Remember your password?
                            </span>

                            <Link href="/login">
                                Login
                            </Link>
                        </div>
                    </>
                )}

                {/* Footer */}
                <div className="footer">
                    © {new Date().getFullYear()} EXOR Medical
                    Systems
                </div>
            </div>

            <style jsx>{`
                * {
                    box-sizing: border-box;
                }

                .reset-page {
                    width: 100%;
                    height: 100dvh;
                    min-height: 100dvh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                    overflow: hidden;
                    background:
                        radial-gradient(
                            circle at 15% 20%,
                            rgba(79, 70, 229, 0.08),
                            transparent 30%
                        ),
                        radial-gradient(
                            circle at 85% 80%,
                            rgba(124, 58, 237, 0.07),
                            transparent 30%
                        ),
                        #f7f8fc;
                    font-family:
                        Inter,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;
                }

                .reset-card {
                    width: 100%;
                    max-width: 455px;
                    max-height: calc(100dvh - 40px);
                    overflow: hidden;
                    background: rgba(255, 255, 255, 0.97);
                    border: 1px solid rgba(15, 23, 42, 0.07);
                    border-radius: 24px;
                    padding: 30px 34px 22px;
                    box-shadow:
                        0 24px 70px rgba(15, 23, 42, 0.10),
                        0 4px 18px rgba(15, 23, 42, 0.05);
                }

                .brand-section {
                    text-align: center;
                    margin-bottom: 20px;
                }

                .brand-logo {
                    width: 48px;
                    height: 48px;
                    margin: 0 auto 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 14px;
                    background: linear-gradient(
                        135deg,
                        #4f46e5,
                        #7c3aed
                    );
                    color: #fff;
                    font-size: 16px;
                    font-weight: 800;
                    letter-spacing: -0.5px;
                    box-shadow:
                        0 8px 20px rgba(79, 70, 229, 0.24);
                }

                .brand-name {
                    color: #111827;
                    font-size: 15px;
                    font-weight: 700;
                    letter-spacing: -0.1px;
                }

                .brand-portal {
                    margin-top: 2px;
                    color: #8a94a6;
                    font-size: 11px;
                    font-weight: 500;
                    text-transform: uppercase;
                    letter-spacing: 1.2px;
                }

                .heading-section {
                    text-align: center;
                    margin-bottom: 22px;
                }

                .heading-section h1 {
                    margin: 0;
                    color: #111827;
                    font-size: 25px;
                    line-height: 1.2;
                    font-weight: 750;
                    letter-spacing: -0.6px;
                }

                .heading-section p {
                    margin: 7px auto 0;
                    max-width: 350px;
                    color: #7a8495;
                    font-size: 13px;
                    line-height: 1.5;
                }

                .reset-form {
                    width: 100%;
                }

                .field {
                    margin-bottom: 16px;
                }

                .field label {
                    display: block;
                    margin-bottom: 7px;
                    color: #374151;
                    font-size: 12px;
                    font-weight: 650;
                }

                .input-wrapper {
                    position: relative;
                    display: flex;
                    align-items: center;
                    width: 100%;
                }

                .input-icon {
                    position: absolute;
                    left: 14px;
                    top: 50%;
                    transform: translateY(-50%);
                    display: flex;
                    align-items: center;
                    color: #9aa3b2;
                    pointer-events: none;
                    z-index: 1;
                }

                .input-wrapper input {
                    width: 100%;
                    height: 46px;
                    padding: 0 45px 0 43px;
                    border: 1px solid #e1e5ec;
                    border-radius: 12px;
                    outline: none;
                    background: #fafbfc;
                    color: #1f2937;
                    font-size: 13px;
                    transition:
                        border-color 0.2s,
                        box-shadow 0.2s,
                        background 0.2s;
                }

                .input-wrapper input::placeholder {
                    color: #b0b7c3;
                }

                .input-wrapper input:focus {
                    background: #ffffff;
                    border-color: #7567e8;
                    box-shadow:
                        0 0 0 3px rgba(79, 70, 229, 0.09);
                }

                .input-wrapper input:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                }

                .password-toggle {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    width: 34px;
                    height: 34px;
                    border: none;
                    background: transparent;
                    color: #9aa3b2;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    cursor: pointer;
                }

                .password-toggle:hover {
                    background: #f0f1f5;
                    color: #5f6877;
                }

                .password-toggle:disabled {
                    cursor: not-allowed;
                }

                .submit-button {
                    width: 100%;
                    height: 46px;
                    margin-top: 3px;
                    border: none;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 9px;
                    background: linear-gradient(
                        135deg,
                        #4f46e5,
                        #7c3aed
                    );
                    color: #ffffff;
                    font-size: 13px;
                    font-weight: 700;
                    cursor: pointer;
                    box-shadow:
                        0 9px 22px rgba(79, 70, 229, 0.22);
                    transition:
                        transform 0.2s,
                        box-shadow 0.2s,
                        opacity 0.2s;
                }

                .submit-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow:
                        0 12px 26px rgba(79, 70, 229, 0.28);
                }

                .submit-button:active:not(:disabled) {
                    transform: translateY(0);
                }

                .submit-button:disabled {
                    opacity: 0.65;
                    cursor: not-allowed;
                    box-shadow: none;
                }

                .button-arrow {
                    font-size: 18px;
                    line-height: 1;
                    margin-top: -1px;
                }

                .button-spinner,
                .spinner {
                    width: 16px;
                    height: 16px;
                    border: 2px solid rgba(255, 255, 255, 0.4);
                    border-top-color: #ffffff;
                    border-radius: 50%;
                    animation: spin 0.75s linear infinite;
                }

                .checking-box {
                    min-height: 100px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    color: #737d8d;
                    font-size: 13px;
                }

                .checking-box .spinner {
                    border-color: #d8dbe4;
                    border-top-color: #5b50d6;
                }

                .message {
                    display: flex;
                    align-items: flex-start;
                    gap: 10px;
                    padding: 12px 13px;
                    margin-bottom: 16px;
                    border-radius: 11px;
                    font-size: 12px;
                    line-height: 1.5;
                }

                .error-message {
                    background: #fff5f5;
                    border: 1px solid #ffdede;
                    color: #c24141;
                }

                .success-message {
                    background: #f2fbf5;
                    border: 1px solid #d3f1dc;
                    color: #28844a;
                }

                .message-icon {
                    flex: 0 0 auto;
                    width: 19px;
                    height: 19px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                    font-size: 11px;
                    font-weight: 800;
                }

                .error-message .message-icon {
                    background: #ffe1e1;
                    color: #c24141;
                }

                .success-message .message-icon {
                    background: #d9f4e1;
                    color: #28844a;
                }

                .login-link {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 5px;
                    margin-top: 18px;
                    color: #8a94a3;
                    font-size: 12px;
                }

                .login-link a {
                    color: #5146d8;
                    font-weight: 700;
                    text-decoration: none;
                }

                .login-link a:hover {
                    text-decoration: underline;
                }

                .footer {
                    margin-top: 18px;
                    padding-top: 15px;
                    border-top: 1px solid #eef0f4;
                    text-align: center;
                    color: #a3aab6;
                    font-size: 10px;
                }

                @keyframes spin {
                    from {
                        transform: rotate(0deg);
                    }

                    to {
                        transform: rotate(360deg);
                    }
                }

                @media (max-width: 520px) {
                    .reset-page {
                        padding: 12px;
                    }

                    .reset-card {
                        max-height: calc(100dvh - 24px);
                        padding: 24px 22px 18px;
                        border-radius: 20px;
                    }

                    .brand-section {
                        margin-bottom: 16px;
                    }

                    .brand-logo {
                        width: 43px;
                        height: 43px;
                        margin-bottom: 7px;
                    }

                    .heading-section {
                        margin-bottom: 18px;
                    }

                    .heading-section h1 {
                        font-size: 22px;
                    }

                    .heading-section p {
                        font-size: 12px;
                    }

                    .field {
                        margin-bottom: 13px;
                    }

                    .input-wrapper input,
                    .submit-button {
                        height: 44px;
                    }
                }

                @media (max-height: 650px) {
                    .reset-card {
                        padding-top: 18px;
                        padding-bottom: 15px;
                    }

                    .brand-section {
                        margin-bottom: 11px;
                    }

                    .brand-logo {
                        width: 38px;
                        height: 38px;
                        border-radius: 11px;
                        margin-bottom: 5px;
                    }

                    .brand-name {
                        font-size: 13px;
                    }

                    .brand-portal {
                        font-size: 9px;
                    }

                    .heading-section {
                        margin-bottom: 13px;
                    }

                    .heading-section h1 {
                        font-size: 21px;
                    }

                    .heading-section p {
                        margin-top: 4px;
                        font-size: 11px;
                    }

                    .field {
                        margin-bottom: 10px;
                    }

                    .field label {
                        margin-bottom: 4px;
                    }

                    .input-wrapper input,
                    .submit-button {
                        height: 40px;
                    }

                    .footer {
                        margin-top: 10px;
                        padding-top: 9px;
                    }
                }

                @media (max-width: 360px) {
                    .reset-page {
                        padding: 8px;
                    }

                    .reset-card {
                        max-height: calc(100dvh - 16px);
                        padding: 18px 16px 13px;
                        border-radius: 17px;
                    }

                    .heading-section h1 {
                        font-size: 20px;
                    }

                    .input-wrapper input {
                        font-size: 12px;
                    }
                }

                @media (max-width: 700px) and (orientation: landscape) and (max-height: 500px) {
                    .reset-page {
                        padding: 8px 12px;
                    }

                    .reset-card {
                        max-width: 520px;
                        padding: 13px 24px 10px;
                    }

                    .brand-section {
                        margin-bottom: 7px;
                    }

                    .brand-logo {
                        display: none;
                    }

                    .heading-section {
                        margin-bottom: 9px;
                    }

                    .heading-section h1 {
                        font-size: 19px;
                    }

                    .heading-section p {
                        display: none;
                    }

                    .field {
                        margin-bottom: 7px;
                    }

                    .input-wrapper input,
                    .submit-button {
                        height: 36px;
                    }

                    .login-link {
                        margin-top: 8px;
                    }

                    .footer {
                        display: none;
                    }
                }
            `}</style>
        </main>
    );
}
