
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleForgotPassword = async (
    e: FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setErrorMessage("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);



      const { data: customer, error: customerError } =
  await supabase
    .from("customer_profiles")
    .select("id, email")
    .eq("email", cleanEmail)
    .maybeSingle();

console.log("Entered email:", cleanEmail);
console.log("Customer result:", customer);
console.log("Customer error:", customerError);

if (customerError) {
  setErrorMessage(
    `Email verification failed: ${customerError.message}`
  );
  return;
}

if (!customer) {
  setErrorMessage(
    "This email address is not registered with us."
  );
  return;
}


      const { error } =
        await supabase.auth.resetPasswordForEmail(
          cleanEmail,
          {
            redirectTo: `${window.location.origin}/reset-password`,
          }
        );

      if (error) {
        console.error(
          "Supabase password reset error:",
          error
        );

        setErrorMessage(error.message);
        return;
      }

      setSuccessMessage(
        "Password reset instructions have been sent to your email. Please check your inbox and click the reset link."
      );

      setEmail("");
    } catch (error) {
      console.error(
        "Forgot password error:",
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
    <>
      <style jsx>{`
        :global(html),
        :global(body) {
          margin: 0;
          padding: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
        }

        :global(body) {
          overflow: hidden;
        }

        * {
          box-sizing: border-box;
        }

        .page {
          width: 100%;
          height: 100dvh;
          min-height: 100dvh;

          display: flex;
          align-items: center;
          justify-content: center;

          padding: 12px 16px;

          overflow: hidden;

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

          max-height: calc(100dvh - 24px);

          background: #ffffff;

          border: 1px solid #edf1f6;
          border-radius: 22px;

          padding: 32px 36px 25px;

          box-shadow:
            0 20px 60px rgba(15, 23, 42, 0.08),
            0 4px 14px rgba(15, 23, 42, 0.04);

          overflow: hidden;
        }

        .brand {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;

          margin-bottom: 22px;
        }

        .brand-mark {
          width: 46px;
          height: 46px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 14px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #0ea5e9
          );

          color: #ffffff;

          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.8px;

          box-shadow:
            0 8px 20px rgba(37, 99, 235, 0.22);

          margin-bottom: 9px;
        }

        .brand-name {
          margin: 0;

          color: #0f172a;

          font-size: 13px;
          font-weight: 700;

          letter-spacing: 0.2px;
        }

        .brand-subtitle {
          margin: 2px 0 0;

          color: #94a3b8;

          font-size: 11px;
          font-weight: 500;
        }

        .heading {
          text-align: center;

          margin-bottom: 24px;
        }

        .heading h1 {
          margin: 0;

          color: #0f172a;

          font-size: 25px;
          line-height: 1.2;

          font-weight: 750;

          letter-spacing: -0.6px;
        }

        .heading p {
          margin: 7px auto 0;

          max-width: 390px;

          color: #64748b;

          font-size: 13px;
          line-height: 1.5;
        }

        .field {
          margin-bottom: 18px;
        }

        .label {
          display: block;

          margin-bottom: 7px;

          color: #334155;

          font-size: 12.5px;
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

          width: 17px;
          height: 17px;

          color: #94a3b8;

          pointer-events: none;
        }

        .input {
          width: 100%;
          height: 46px;

          padding: 0 14px 0 43px;

          border: 1px solid #dce3ec;

          border-radius: 11px;

          background: #ffffff;

          color: #0f172a;

          font-family: inherit;

          font-size: 13.5px;

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

          box-shadow:
            0 0 0 4px rgba(37, 99, 235, 0.09);
        }

        .error,
        .success {
          display: flex;
          align-items: flex-start;

          gap: 9px;

          margin-bottom: 17px;

          padding: 11px 12px;

          border-radius: 10px;

          font-size: 12.5px;
          line-height: 1.45;
        }

        .error {
          border: 1px solid #fecaca;

          background: #fff5f5;

          color: #b42318;
        }

        .success {
          border: 1px solid #bbf7d0;

          background: #f0fdf4;

          color: #166534;
        }

        .message-icon {
          flex: 0 0 auto;

          width: 16px;
          height: 16px;

          margin-top: 1px;
        }

        .submit-button {
          width: 100%;
          height: 47px;

          border: none;

          border-radius: 11px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #0ea5e9
          );

          color: #ffffff;

          font-family: inherit;

          font-size: 13.5px;
          font-weight: 700;

          letter-spacing: 0.1px;

          cursor: pointer;

          box-shadow:
            0 8px 20px rgba(37, 99, 235, 0.2);

          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease,
            opacity 0.2s ease;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-1px);

          box-shadow:
            0 11px 25px rgba(37, 99, 235, 0.26);
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

          gap: 8px;
        }

        .button-spinner {
          width: 15px;
          height: 15px;

          border: 2px solid rgba(255, 255, 255, 0.4);

          border-top-color: #ffffff;

          border-radius: 50%;

          animation: spin 0.8s linear infinite;
        }

        .login-row {
          text-align: center;

          margin-top: 21px;

          color: #64748b;

          font-size: 12.5px;
        }

        .login-link {
          color: #2563eb;

          font-weight: 700;

          text-decoration: none;

          margin-left: 3px;
        }

        .login-link:hover {
          color: #1d4ed8;

          text-decoration: underline;
        }

        .footer {
          margin-top: 17px;

          padding-top: 12px;

          border-top: 1px solid #eef2f6;

          text-align: center;

          color: #a0aabd;

          font-size: 10px;

          font-weight: 500;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        /*
         * TABLET / SMALL LAPTOP
         */
        @media (max-width: 700px) {
          .page {
            padding: 10px 14px;
          }

          .card {
            max-width: 450px;

            padding: 29px 30px 23px;

            border-radius: 20px;
          }
        }

        /*
         * MOBILE
         */
        @media (max-width: 520px) {
          .page {
            padding: 7px 12px;
          }

          .card {
            max-width: 100%;

            max-height: calc(100dvh - 14px);

            padding: 25px 20px 20px;

            border-radius: 18px;
          }

          .brand {
            margin-bottom: 18px;
          }

          .brand-mark {
            width: 42px;
            height: 42px;

            border-radius: 12px;

            font-size: 14px;
          }

          .heading {
            margin-bottom: 20px;
          }

          .heading h1 {
            font-size: 23px;
          }

          .heading p {
            font-size: 11.5px;
          }

          .input {
            height: 44px;

            font-size: 13px;
          }

          .submit-button {
            height: 45px;

            font-size: 13px;
          }
        }

        /*
         * SHORT SCREENS
         */
        @media (max-height: 700px) {
          .page {
            padding-top: 5px;
            padding-bottom: 5px;
          }

          .card {
            max-height: calc(100dvh - 10px);

            padding-top: 18px;
            padding-bottom: 14px;
          }

          .brand {
            margin-bottom: 11px;
          }

          .brand-mark {
            width: 38px;
            height: 38px;

            border-radius: 11px;

            font-size: 13px;

            margin-bottom: 5px;
          }

          .brand-name {
            font-size: 11.5px;
          }

          .brand-subtitle {
            display: none;
          }

          .heading {
            margin-bottom: 13px;
          }

          .heading h1 {
            font-size: 21px;
          }

          .heading p {
            margin-top: 4px;

            font-size: 10.5px;
          }

          .field {
            margin-bottom: 11px;
          }

          .label {
            margin-bottom: 4px;

            font-size: 11px;
          }

          .input {
            height: 39px;

            font-size: 11.5px;

            padding-left: 38px;
          }

          .input-icon {
            width: 15px;
            height: 15px;

            left: 11px;
          }

          .error,
          .success {
            margin-bottom: 9px;

            padding: 7px 9px;

            font-size: 10.5px;
          }

          .message-icon {
            width: 14px;
            height: 14px;
          }

          .submit-button {
            height: 40px;

            border-radius: 8px;

            font-size: 11.5px;
          }

          .login-row {
            margin-top: 11px;

            font-size: 10.5px;
          }

          .footer {
            margin-top: 8px;

            padding-top: 7px;

            font-size: 8.5px;
          }
        }

        /*
         * EXTRA SHORT MOBILE LANDSCAPE
         */
        @media (max-height: 560px) {
          .page {
            padding: 3px 9px;
          }

          .card {
            max-height: calc(100dvh - 6px);

            padding: 9px 18px;

            border-radius: 14px;
          }

          .brand {
            margin-bottom: 6px;
          }

          .brand-mark {
            width: 30px;
            height: 30px;

            border-radius: 8px;

            font-size: 10px;

            margin-bottom: 2px;
          }

          .brand-name {
            font-size: 9px;
          }

          .heading {
            margin-bottom: 7px;
          }

          .heading h1 {
            font-size: 17px;
          }

          .heading p {
            display: none;
          }

          .field {
            margin-bottom: 6px;
          }

          .label {
            display: none;
          }

          .input {
            height: 32px;

            border-radius: 7px;

            font-size: 10px;

            padding-left: 34px;
          }

          .input-icon {
            width: 12px;
            height: 12px;

            left: 10px;
          }

          .error,
          .success {
            margin-bottom: 6px;

            padding: 4px 6px;

            font-size: 9px;
          }

          .message-icon {
            width: 12px;
            height: 12px;
          }

          .submit-button {
            height: 33px;

            border-radius: 7px;

            font-size: 10px;
          }

          .login-row {
            margin-top: 6px;

            font-size: 9px;
          }

          .footer {
            display: none;
          }
        }

        /*
         * VERY NARROW PHONES
         */
        @media (max-width: 360px) {
          .page {
            padding-left: 6px;
            padding-right: 6px;
          }

          .card {
            padding-left: 15px;
            padding-right: 15px;
          }

          .heading h1 {
            font-size: 21px;
          }

          .heading p {
            font-size: 10.5px;
          }
        }
      `}</style>

      <main className="page">
        <div className="card">

          {/* Brand */}
          <div className="brand">
            {/* <div className="brand-mark">
              EX
            </div> */}

            <p className="brand-name">
              EXOR Medical Systems
            </p>

            <p className="brand-subtitle">
              Customer Portal
            </p>
          </div>

          {/* Heading */}
          <div className="heading">
            <h1>
              Forgot your password?
            </h1>

            <p>
              Enter your registered email address and
              we&apos;ll send you a secure link to reset
              your password.
            </p>
          </div>

          <form onSubmit={handleForgotPassword}>

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
                  placeholder="Enter your registered email"
                  disabled={loading}
                  autoComplete="email"
                  className="input"
                />

              </div>
            </div>

            {/* Error */}
            {errorMessage && (
              <div className="error">

                <svg
                  className="message-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path d="M12 8v4" />
                  <path d="M12 16h.01" />
                </svg>

                <span>
                  {errorMessage}
                </span>

              </div>
            )}

            {/* Success */}
            {successMessage && (
              <div className="success">

                <svg
                  className="message-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                  />

                  <path d="m8 12 2.5 2.5L16 9" />
                </svg>

                <span>
                  {successMessage}
                </span>

              </div>
            )}

            {/* Send Reset Link */}
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
                  ? "Sending..."
                  : "Send Reset Link"}

              </span>
            </button>

          </form>

          {/* Back to Login */}
          <div className="login-row">
            Remember your password?

            <Link
              href="/login"
              className="login-link"
            >
              Login
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
