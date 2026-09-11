
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabaseClient";


export default function RegisterPage() {
    const [customerName, setCustomerName] = useState("");
    const [companyName, setCompanyName] = useState("");
    const [mobileNumber, setMobileNumber] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] =
        useState(false);

    const handleRegister = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault();

        setErrorMessage("");
        setSuccessMessage("");

        const cleanCustomerName = customerName.trim();
        const cleanCompanyName = companyName.trim();
        const cleanMobileNumber = mobileNumber.trim();
        const cleanEmail = email.trim().toLowerCase();

        // -----------------------------
        // VALIDATION
        // -----------------------------
        if (!cleanCustomerName) {
            setErrorMessage("Please enter your name.");
            return;
        }

        if (!cleanCompanyName) {
            setErrorMessage("Please enter your company name.");
            return;
        }

        if (!/^\d{10}$/.test(cleanMobileNumber)) {
            setErrorMessage(
                "Please enter a valid 10-digit mobile number."
            );
            return;
        }

        if (!cleanEmail) {
            setErrorMessage("Please enter your email address.");
            return;
        }

        if (password.length < 6) {
            setErrorMessage(
                "Password must be at least 6 characters long."
            );
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);




            const { data: existingCustomer, error: customerCheckError } =
                await supabase
                    .from("customer_profiles")
                    .select("id")
                    .eq("email", cleanEmail)
                    .maybeSingle();

            if (customerCheckError) {
                console.error(
                    "Customer email check error:",
                    customerCheckError
                );

                setErrorMessage(
                    "Unable to verify the email address. Please try again."
                );

                return;
            }

            if (existingCustomer) {
                setErrorMessage(
                    "This email address is already registered. Please use a different email address."
                );

                return;
            }



            // -----------------------------
            // CREATE SUPABASE AUTH USER
            // -----------------------------

            const { data, error } =
                await supabase.auth.signUp({
                    email: cleanEmail,
                    password,
                    options: {
                        data: {
                            customer_name: cleanCustomerName,
                            company_name: cleanCompanyName,
                            mobile_number: cleanMobileNumber,
                            email: cleanEmail,
                        },
                    },
                });

            // -----------------------------
            // HANDLE AUTH REGISTRATION ERROR
            // -----------------------------

            if (error) {
                console.error(
                    "Registration error:",
                    JSON.stringify(error, null, 2)
                );

                const errorText =
                    error.message?.toLowerCase() || "";

                if (
                    error.status === 429 ||
                    errorText.includes("too many requests") ||
                    errorText.includes("security purposes")
                ) {
                    setErrorMessage(
                        "Too many registration attempts. Please wait before trying again."
                    );
                } else if (
                    errorText.includes("already registered") ||
                    errorText.includes("user already registered")
                ) {
                    setErrorMessage(
                        "This email address is already registered. Please use a different email address."
                    );
                } else {
                    setErrorMessage(
                        error.message ||
                        "Registration failed. Please try again."
                    );
                }

                return;
            }

            // -----------------------------
            // MAKE SURE AUTH USER EXISTS
            // -----------------------------

            if (!data.user) {
                setErrorMessage(
                    "Registration was not completed. Please try again."
                );
                return;
            }

            console.log(
                "New Auth user created:",
                data.user.id
            );

            // // -----------------------------
            // // CREATE CUSTOMER PROFILE
            // // -----------------------------

            // const { data: profileData, error: profileError } =
            //   await supabase
            //     .from("customer_profiles")
            //     .insert({
            //       user_id: data.user.id,
            //       company_name: cleanCompanyName,
            //       mobile_number: cleanMobileNumber,
            //       email: cleanEmail,
            //     })
            //     .select()
            //     .single();

            // // -----------------------------
            // // HANDLE PROFILE ERROR
            // // -----------------------------

            // if (profileError) {
            //   console.error(
            //     "Customer profile creation error:",
            //     JSON.stringify(profileError, null, 2)
            //   );

            //   if (profileError.code === "23505") {
            //     setErrorMessage(
            //       "This customer account already exists. Please try logging in instead."
            //     );
            //   } else {
            //     setErrorMessage(
            //       profileError.message ||
            //         "Your account was created, but we could not save your customer information."
            //     );
            //   }

            //   return;
            // }

            // console.log(
            //   "Customer profile created successfully:",
            //   profileData
            // );

            // -----------------------------
            // CLEAR FORM
            // -----------------------------
            setCustomerName("");
            setCompanyName("");
            setMobileNumber("");
            setEmail("");
            setPassword("");
            setConfirmPassword("");

            // -----------------------------
            // SUCCESS MESSAGE
            // -----------------------------

            setSuccessMessage(
                "Account created successfully. Please check your email and confirm your account before logging in."
            );

        } catch (error) {
            console.error(
                "Registration exception:",
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

          padding: 27px 36px 20px;

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

          margin-bottom: 15px;
        }

        .brand-mark {
          width: 43px;
          height: 43px;

          display: flex;
          align-items: center;
          justify-content: center;

          border-radius: 13px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #0ea5e9
          );

          color: #ffffff;

          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.8px;

          box-shadow:
            0 8px 20px rgba(37, 99, 235, 0.22);

          margin-bottom: 8px;
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

          font-size: 10.5px;
          font-weight: 500;
        }

        .heading {
          text-align: center;
          margin-bottom: 17px;
        }

        .heading h1 {
          margin: 0;

          color: #0f172a;

          font-size: 24px;
          line-height: 1.2;

          font-weight: 750;
          letter-spacing: -0.6px;
        }

        .heading p {
          margin: 5px 0 0;

          color: #64748b;

          font-size: 12px;
          line-height: 1.4;
        }

        .field {
          margin-bottom: 10px;
        }

        .label {
          display: block;

          margin-bottom: 5px;

          color: #334155;

          font-size: 11.5px;
          font-weight: 650;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;

          left: 13px;
          top: 50%;

          transform: translateY(-50%);

          width: 16px;
          height: 16px;

          color: #94a3b8;

          pointer-events: none;
        }

        .input {
          width: 100%;
          height: 41px;

          padding: 0 12px 0 40px;

          border: 1px solid #dce3ec;
          border-radius: 10px;

          background: #ffffff;

          color: #0f172a;

          font-family: inherit;
          font-size: 12.5px;

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

        .password-input {
          padding-right: 44px;
        }

        .password-toggle {
          position: absolute;

          right: 8px;
          top: 50%;

          transform: translateY(-50%);

          width: 29px;
          height: 29px;

          display: flex;
          align-items: center;
          justify-content: center;

          border: none;
          border-radius: 7px;

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

        .error {
          display: flex;
          align-items: flex-start;

          gap: 8px;

          margin-top: 7px;
          margin-bottom: 10px;

          padding: 8px 10px;

          border: 1px solid #fecaca;
          border-radius: 9px;

          background: #fff5f5;

          color: #b42318;

          font-size: 11.5px;
          line-height: 1.4;
        }

        .success {
          display: flex;
          align-items: flex-start;

          gap: 8px;

          margin-top: 7px;
          margin-bottom: 10px;

          padding: 8px 10px;

          border: 1px solid #bbf7d0;
          border-radius: 9px;

          background: #f0fdf4;

          color: #166534;

          font-size: 11.5px;
          line-height: 1.4;
        }

        .message-icon {
          flex: 0 0 auto;

          width: 15px;
          height: 15px;

          margin-top: 1px;
        }

        .submit-button {
          width: 100%;
          height: 43px;

          border: none;
          border-radius: 10px;

          background: linear-gradient(
            135deg,
            #2563eb,
            #0ea5e9
          );

          color: #ffffff;

          font-family: inherit;

          font-size: 12.5px;
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
          width: 14px;
          height: 14px;

          border: 2px solid rgba(255, 255, 255, 0.4);
          border-top-color: #ffffff;

          border-radius: 50%;

          animation: spin 0.8s linear infinite;
        }

        .login-row {
          text-align: center;

          margin-top: 13px;

          color: #64748b;

          font-size: 11.5px;
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
          margin-top: 12px;

          padding-top: 9px;

          border-top: 1px solid #eef2f6;

          text-align: center;

          color: #a0aabd;

          font-size: 9.5px;
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

            padding: 25px 30px 19px;

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

            padding: 22px 20px 17px;

            border-radius: 18px;
          }

          .brand {
            margin-bottom: 13px;
          }

          .brand-mark {
            width: 41px;
            height: 41px;

            border-radius: 12px;

            font-size: 14px;
          }

          .heading {
            margin-bottom: 15px;
          }

          .heading h1 {
            font-size: 22px;
          }

          .heading p {
            font-size: 11px;
          }

          .input {
            height: 40px;
            font-size: 12px;
          }

          .submit-button {
            height: 42px;
            font-size: 12px;
          }
        }

        /*
         * VERY SHORT SCREENS
         *
         * Phones in landscape,
         * small laptops,
         * split-screen windows.
         */
        @media (max-height: 700px) {
          .page {
            padding-top: 5px;
            padding-bottom: 5px;
          }

          .card {
            max-height: calc(100dvh - 10px);

            padding-top: 13px;
            padding-bottom: 11px;
          }

          .brand {
            margin-bottom: 7px;
          }

          .brand-mark {
            width: 35px;
            height: 35px;

            border-radius: 10px;

            font-size: 12px;

            margin-bottom: 4px;
          }

          .brand-name {
            font-size: 10.5px;
          }

          .brand-subtitle {
            display: none;
          }

          .heading {
            margin-bottom: 9px;
          }

          .heading h1 {
            font-size: 19px;
          }

          .heading p {
            margin-top: 3px;
            font-size: 10px;
          }

          .field {
            margin-bottom: 7px;
          }

          .label {
            margin-bottom: 3px;
            font-size: 10.5px;
          }

          .input {
            height: 35px;
            font-size: 11px;
          }

          .input-icon {
            width: 14px;
            height: 14px;

            left: 11px;
          }

          .input {
            padding-left: 36px;
          }

          .password-input {
            padding-right: 40px;
          }

          .password-toggle {
            width: 27px;
            height: 27px;
          }

          .error,
          .success {
            margin-top: 4px;
            margin-bottom: 7px;

            padding: 6px 8px;

            font-size: 10px;
          }

          .message-icon {
            width: 13px;
            height: 13px;
          }

          .submit-button {
            height: 37px;

            border-radius: 8px;

            font-size: 10.5px;
          }

          .login-row {
            margin-top: 8px;
            font-size: 10px;
          }

          .footer {
            margin-top: 7px;
            padding-top: 6px;
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

            padding: 8px 18px;

            border-radius: 14px;
          }

          .brand {
            margin-bottom: 5px;
          }

          .brand-mark {
            width: 29px;
            height: 29px;

            border-radius: 8px;

            font-size: 10px;

            margin-bottom: 2px;
          }

          .brand-name {
            font-size: 9px;
          }

          .heading {
            margin-bottom: 6px;
          }

          .heading h1 {
            font-size: 16px;
          }

          .heading p {
            display: none;
          }

          .field {
            margin-bottom: 5px;
          }

          .label {
            display: none;
          }

          .input {
            height: 31px;

            border-radius: 7px;

            font-size: 10px;
          }

          .input-icon {
            width: 12px;
            height: 12px;
          }

          .password-toggle {
            width: 24px;
            height: 24px;
          }

          .error,
          .success {
            margin-top: 3px;
            margin-bottom: 5px;

            padding: 4px 6px;

            font-size: 9px;
          }

          .submit-button {
            height: 32px;

            border-radius: 7px;

            font-size: 10px;
          }

          .login-row {
            margin-top: 5px;
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
            padding-left: 14px;
            padding-right: 14px;
          }

          .heading h1 {
            font-size: 20px;
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
                            Create your account
                        </h1>

                        <p>
                            Register to securely access our latest product price list.
                        </p>
                    </div>

                    <form onSubmit={handleRegister}>

                        {/* Customer Name */}
                        <div className="field">
                            <label
                                htmlFor="customerName"
                                className="label"
                            >
                                Customer Name
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
                                    <circle
                                        cx="12"
                                        cy="8"
                                        r="3.5"
                                    />

                                    <path d="M5 21c.8-4 3.2-6 7-6s6.2 2 7 6" />
                                </svg>

                                <input
                                    id="customerName"
                                    type="text"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                    placeholder="Enter your name"
                                    disabled={loading}
                                    autoComplete="name"
                                    className="input"
                                />

                            </div>
                        </div>

                        {/* Company Name */}
                        <div className="field">
                            <label
                                htmlFor="companyName"
                                className="label"
                            >
                                Company Name
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
                                    <path d="M3 21h18" />

                                    <path d="M5 21V5a2 2 0 0 1 2-2h7a2 2 0 0 1 2 2v16" />

                                    <path d="M16 9h3a2 2 0 0 1 2 2v10" />

                                    <path d="M9 7h2" />
                                    <path d="M9 11h2" />
                                    <path d="M9 15h2" />

                                    <path d="M16 13h2" />
                                    <path d="M16 17h2" />
                                </svg>

                                <input
                                    id="companyName"
                                    type="text"
                                    value={companyName}
                                    onChange={(e) =>
                                        setCompanyName(e.target.value)
                                    }
                                    placeholder="Enter company name"
                                    disabled={loading}
                                    autoComplete="organization"
                                    className="input"
                                />
                            </div>
                        </div>

                        {/* Mobile Number */}
                        <div className="field">
                            <label
                                htmlFor="mobileNumber"
                                className="label"
                            >
                                Mobile Number
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
                                        x="6"
                                        y="2.5"
                                        width="12"
                                        height="19"
                                        rx="2"
                                    />

                                    <path d="M10 5h4" />

                                    <circle
                                        cx="12"
                                        cy="18.5"
                                        r="1"
                                    />
                                </svg>

                                <input
                                    id="mobileNumber"
                                    type="tel"
                                    value={mobileNumber}
                                    onChange={(e) => {
                                        const value =
                                            e.target.value
                                                .replace(/\D/g, "")
                                                .slice(0, 10);

                                        setMobileNumber(value);
                                    }}
                                    placeholder="Enter 10-digit mobile number"
                                    disabled={loading}
                                    autoComplete="tel"
                                    inputMode="numeric"
                                    maxLength={10}
                                    className="input"
                                />
                            </div>
                        </div>

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
                                    placeholder="Create a password"
                                    disabled={loading}
                                    autoComplete="new-password"
                                    className="input password-input"
                                />

                                <button
                                    type="button"
                                    className="password-toggle"
                                    onClick={() =>
                                        setShowPassword(!showPassword)
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
                                            width="16"
                                            height="16"
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
                                            width="16"
                                            height="16"
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

                        {/* Confirm Password */}
                        <div className="field">
                            <label
                                htmlFor="confirmPassword"
                                className="label"
                            >
                                Confirm Password
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

                                    <path d="m9 16 2 2 4-4" />
                                </svg>

                                <input
                                    id="confirmPassword"
                                    type={
                                        showConfirmPassword
                                            ? "text"
                                            : "password"
                                    }
                                    value={confirmPassword}
                                    onChange={(e) =>
                                        setConfirmPassword(e.target.value)
                                    }
                                    placeholder="Confirm your password"
                                    disabled={loading}
                                    autoComplete="new-password"
                                    className="input password-input"
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
                                            width="16"
                                            height="16"
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
                                            width="16"
                                            height="16"
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

                        {/* Register Button */}
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
                                    ? "Creating account..."
                                    : "Create Customer Account"}

                            </span>
                        </button>
                    </form>

                    {/* Login */}
                    <div className="login-row">
                        Already have an account?

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

