"use client";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { RootState, AppDispatch } from "../store/store";
import { fetchCities } from "../store/slices/citiesSlice";
import { postUser } from "../store/slices/userSlice";
import { signIn } from "next-auth/react";
import { User } from "../types/user";
import { useRouter } from "next/navigation";
import { EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { Modal, Button } from "antd";
import { toast } from "react-hot-toast";
import OTPInput from "react-otp-input";
import "./styles.css";

const CreateUser = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { cities } = useSelector((state: RootState) => state.cities);
    const { error: userError } = useSelector((state: RootState) => state.user);
    const router = useRouter();

    const [username, setUsername] = useState("");
    const [name, setName] = useState("");
    const [DOB, setDOB] = useState("");
    const [cityId, setCityId] = useState<number | null>(null);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [phone_number, setPhoneNumber] = useState("");
    const [role, setRole] = useState<"regular user" | "vet">("regular user");

    // OTP Verification States
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");

    const [emailExistsError, setEmailExistsError] = useState("");
    const [passwordMismatchError, setPasswordMismatchError] = useState("");
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [generalError, setGeneralError] = useState("");

    const [isLoading, setIsLoading] = useState(false);

    const [isEmailFocused, setIsEmailFocused] = useState(false);
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    const [googleLoading, setGoogleLoading] = useState(false); // Loading state for Google login

    const handleBackToLogin = () => {
        router.push("/");
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            await signIn("google"); // next-auth handles Google login
        } catch (error) {
            console.error("Google login failed:", error);
            toast.error("Google login failed. Please try again!");
        } finally {
            setGoogleLoading(false);
        }
    };

    const PasswordRules = ({ password }: { password: string }) => (
        <div className="mt-0 space-y-1 text-sm">
            <p
                className={`flex items-center ${
                    password.length > 0 ? "text-gray-600" : "text-gray-400"
                }`}>
                Password must contain:
            </p>
            <ul className="list-disc pl-5 space-y-1">
                <li
                    className={`flex items-center ${
                        /[A-Z]/.test(password)
                            ? "text-green-500"
                            : "text-red-500"
                    }`}>
                    {/[A-Z]/.test(password) ? "✓" : "✗"} At least one uppercase
                    letter
                </li>
                <li
                    className={`flex items-center ${
                        /[a-z]/.test(password)
                            ? "text-green-500"
                            : "text-red-500"
                    }`}>
                    {/[a-z]/.test(password) ? "✓" : "✗"} At least one lowercase
                    letter
                </li>
                <li
                    className={`flex items-center ${
                        /[0-9]/.test(password)
                            ? "text-green-500"
                            : "text-red-500"
                    }`}>
                    {/[0-9]/.test(password) ? "✓" : "✗"} At least one number
                </li>
                <li
                    className={`flex items-center ${
                        /[@$!%*?&]/.test(password)
                            ? "text-green-500"
                            : "text-red-500"
                    }`}>
                    {/[@$!%*?&]/.test(password) ? "✓" : "✗"} At least one
                    special character (@$!%*?&)
                </li>
                <li
                    className={`flex items-center ${
                        password.length >= 8 ? "text-green-500" : "text-red-500"
                    }`}>
                    {password.length >= 8 ? "✓" : "✗"} Minimum 8 characters
                </li>
            </ul>
        </div>
    );

    useEffect(() => {
        dispatch(fetchCities());
    }, [dispatch]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setEmailExistsError("");
        setPasswordMismatchError("");
        setFormErrors({});
        setGeneralError("");

        if (!isEmailVerified) {
            setFormErrors((prev) => ({
                ...prev,
                email: "Please verify your email first",
            }));
            setIsLoading(false);
            return;
        }

        if (!validatePassword(password)) {
            setFormErrors((prev) => ({
                ...prev,
                password:
                    "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one special character",
            }));
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            setPasswordMismatchError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        const newUser: Omit<User, "user_id"> = {
            username,
            name,
            DOB,
            city_id: cityId,
            email,
            password,
            phone_number,
            role: "regular user",
        };

        try {
            const result = await dispatch(postUser(newUser));

            if (postUser.rejected.match(result)) {
                const errorPayload = result.payload as {
                    message?: string;
                    errorCode?: string;
                };
                if (errorPayload?.errorCode === "EMAIL_EXISTS") {
                    setEmailExistsError("This email is already registered");
                    setIsEmailVerified(false);
                    setShowOtpModal(false);
                } else {
                    setGeneralError(
                        errorPayload?.message ||
                            "Failed to create account. Please try again."
                    );
                }
                return;
            }

            if (role === "vet") {
                router.push(`/vet-register?user_id=${result.payload.user_id}`);
            } else {
                router.push("/login");
            }
        } catch (error) {
            setGeneralError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyEmail = async () => {
        if (!validateEmail(email)) {
            setFormErrors((prev) => ({
                ...prev,
                email: "Please enter a valid email address",
            }));
            return;
        }

        try {
            // Implement actual email verification API call
            const response = await fetch("/api/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Email verification failed"
                );
            }

            setShowOtpModal(true);
            setFormErrors((prev) => ({ ...prev, email: "" }));
        } catch (error) {
            setFormErrors((prev) => ({
                ...prev,
                email:
                    error instanceof Error
                        ? error.message
                        : "Failed to send verification code",
            }));
        }
    };

    const validateEmail = (email: string) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const EmailValidation = ({ email }: { email: string }) => {
        const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

        return (
            <div className="mt-0 space-y-1 text-sm">
                <p
                    className={`flex items-center ${
                        email.length > 0 ? "text-gray-600" : "text-gray-400"
                    }`}>
                    Email must be:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                    <li
                        className={`flex items-center ${
                            isValid ? "text-green-500" : "text-red-500"
                        }`}>
                        {isValid ? "✓" : "✗"} Properly formatted (e.g.,
                        example@domain.com)
                    </li>
                </ul>
            </div>
        );
    };

    const validatePassword = (password: string) => {
        const passwordRegex =
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return passwordRegex.test(password);
    };

    const handleOtpChange = (otp: string) => {
        setOtp(otp);
        if (otp.length === 6) {
            handleSubmitOtp();
        }
    };

    const handleSubmitOtp = async () => {
        if (otp.length !== 6) {
            setOtpError("Please enter a 6-digit code");
            return;
        }

        try {
            // Implement actual OTP verification API call
            const response = await fetch("/api/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(
                    errorData.message || "Invalid verification code"
                );
            }

            setIsEmailVerified(true);
            setShowOtpModal(false);
            setOtpError("");
        } catch (error) {
            setOtpError(
                error instanceof Error ? error.message : "Verification failed"
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row">
            {/* Left Section (Logo) - Unchanged */}
            <div className="lg:w-1/2 flex flex-col justify-center items-center bg-primary p-8 text-white rounded-b-3xl lg:rounded-r-3xl lg:rounded-b-none">
                <img
                    src="/paltu_logo.svg"
                    alt="Paltu Logo"
                    className="mb-3 mt-2 w-40 lg:w-full max-w-full"
                />
            </div>

            {/* Right Section (Form) */}
            <div className="lg:w-1/2 bg-gray-100 flex items-center justify-center px-4 py-8 lg:px-8 lg:py-12">
                {
                    <button
                        onClick={handleBackToLogin}
                        className="absolute top-4 left-4 text-white hover:text-white-600 flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 mr-1"
                            viewBox="0 0 20 20"
                            fill="currentColor">
                            <path
                                fillRule="evenodd"
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </button>
                }

                <form
                    onSubmit={handleSubmit}
                    className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 space-y-4">
                    <h2 className="text-3xl font-semibold text-center mb-2">
                        Sign Up
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        Fill in the details to create a new account.
                    </p>

                    {/* Full Name */}
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="Enter your full name"
                            required
                        />
                    </div>

                    {generalError && (
                        <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                            {generalError}
                        </div>
                    )}

                    <div className="relative">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Email
                        </label>
                        <div className="flex gap-2 relative">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onFocus={() => setIsEmailFocused(true)}
                                onBlur={() =>
                                    setTimeout(
                                        () => setIsEmailFocused(false),
                                        100
                                    )
                                }
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                required
                                disabled={isEmailVerified}
                            />
                            <button
                                type="button"
                                onClick={handleVerifyEmail}
                                disabled={
                                    !validateEmail(email) || isEmailVerified
                                }
                                className={`px-4 rounded-xl transition-colors ${
                                    isEmailVerified
                                        ? "bg-green-500 text-white"
                                        : validateEmail(email)
                                        ? "bg-primary text-white hover:bg-primary-dark"
                                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                                }`}>
                                {isEmailVerified ? "Verified" : "Verify"}
                            </button>

                            {isEmailFocused && !isEmailVerified && (
                                <div className="absolute top-full left-0 mt-2 w-full z-10 animate-popup">
                                    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                                        <EmailValidation email={email} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {(formErrors.email || emailExistsError) && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.email || emailExistsError}
                            </p>
                        )}
                    </div>

                    {/* Phone Number */}
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Phone Number
                        </label>
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value="+92"
                                className="w-12 border border-gray-300 pl-2 rounded-xl py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                disabled
                            />
                            <input
                                type="text"
                                value={phone_number}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                placeholder="3338888666"
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                required
                            />
                        </div>
                    </div>

                    {/* Date of Birth */}
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Date of Birth
                        </label>
                        <input
                            type="date"
                            value={DOB}
                            onChange={(e) => setDOB(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                    </div>

                    {/* City */}
                    <div>
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            City
                        </label>
                        <select
                            value={cityId || ""}
                            onChange={(e) => setCityId(Number(e.target.value))}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            required>
                            <option value="">Select a City</option>
                            {cities.map((city) => (
                                <option key={city.city_id} value={city.city_id}>
                                    {city.city_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="relative">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onFocus={() => setIsPasswordFocused(true)}
                                onBlur={() =>
                                    setTimeout(
                                        () => setIsPasswordFocused(false),
                                        100
                                    )
                                }
                                className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                required
                                pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$"
                            />

                            {isPasswordFocused && (
                                <div className="absolute top-full left-0 mt-2 w-full z-10 animate-popup">
                                    <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
                                        <PasswordRules password={password} />
                                    </div>
                                </div>
                            )}
                        </div>
                        {formErrors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {formErrors.password}
                            </p>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="relative">
                        <label className="block text-gray-700 text-sm font-medium mb-1">
                            Confirm Password
                        </label>
                        <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                            required
                        />
                        <span
                            onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500 mt-6">
                            {showConfirmPassword ? (
                                <EyeInvisibleOutlined />
                            ) : (
                                <EyeOutlined />
                            )}
                        </span>
                    </div>

                    {passwordMismatchError && (
                        <p className="text-red-500 text-sm mt-1">
                            {passwordMismatchError}
                        </p>
                    )}

                    {/* Role Checkbox */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            checked={role === "vet"}
                            onChange={() =>
                                setRole((prevRole) =>
                                    prevRole === "regular user"
                                        ? "vet"
                                        : "regular user"
                                )
                            }
                            className="h-4 w-4 border-gray-300 text-primary rounded focus:ring-primary focus:outline-none"
                        />
                        <label className="text-gray-700 text-sm">
                            I am a vet
                        </label>
                    </div>

                    {/* Existing Submit Button */}
                    <button
                        type="submit"
                        disabled={
                            isLoading ||
                            !isEmailVerified ||
                            password !== confirmPassword
                        }
                        className={`w-full bg-primary text-white py-2 px-4 rounded-xl transition ${
                            isLoading ||
                            !isEmailVerified ||
                            password !== confirmPassword
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-primary-dark"
                        }`}>
                        {isLoading ? "Creating Account..." : "Create Account"}
                    </button>

                    {/* OR Divider */}
                    <div className="relative flex items-center py-4">
                        <div className="flex-grow border-t border-gray-300"></div>
                        <span className="flex-shrink mx-4 text-gray-500">
                            OR
                        </span>
                        <div className="flex-grow border-t border-gray-300"></div>
                    </div>

                    {/* Google Login Button */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        disabled={googleLoading}
                        className={`w-full py-2 px-4 rounded-xl text-gray-600 border border-gray-400 hover:border-primary hover:text-primary transition flex items-center justify-center space-x-2 ${
                            googleLoading ? "opacity-50 cursor-not-allowed" : ""
                        }`}>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-5 h-5">
                            <path
                                d="M23.76 12.26c0-.79-.07-1.58-.19-2.34H12v4.44h6.66c-.29 1.56-1.15 2.88-2.46 3.76v3.12h3.98c2.32-2.14 3.68-5.29 3.68-8.98z"
                                fill="#4285F4"
                            />
                            <path
                                d="M12 24c3.3 0 6.07-1.09 8.09-2.94l-3.98-3.12c-1.1.74-2.52 1.18-4.11 1.18-3.15 0-5.82-2.13-6.77-5.01H1.2v3.14C3.25 21.08 7.34 24 12 24z"
                                fill="#34A853"
                            />
                            <path
                                d="M5.23 14.12c-.25-.74-.39-1.54-.39-2.37 0-.83.14-1.63.38-2.37V6.23H1.2A11.98 11.98 0 000 12c0 1.89.44 3.68 1.2 5.27l4.03-3.15z"
                                fill="#FBBC05"
                            />
                            <path
                                d="M12 4.74c1.8 0 3.4.62 4.67 1.84l3.5-3.5C17.99 1.12 15.22 0 12 0 7.34 0 3.25 2.92 1.2 6.73l4.03 3.15c.94-2.88 3.61-5.01 6.77-5.01z"
                                fill="#EA4335"
                            />
                        </svg>
                        <span>
                            {googleLoading
                                ? "Logging in..."
                                : "Continue with Google"}
                        </span>
                    </button>
                </form>
            </div>

            {/* OTP Modal */}
            <Modal
                title="Email Verification"
                visible={showOtpModal}
                onCancel={() => setShowOtpModal(false)}
                footer={null}
                centered
                className="[&_.ant-modal-content]:p-6">
                <div className="space-y-4">
                    <p className="text-center text-gray-600">
                        Enter the 6-digit code sent to {email}
                    </p>
                    <OTPInput
                        value={otp}
                        onChange={handleOtpChange}
                        numInputs={6}
                        renderSeparator={<span className="mx-1" />}
                        renderInput={(props) => (
                            <input
                                {...props}
                                type="tel" // Changed from number to tel
                                inputMode="numeric"
                                className="w-12 h-12 text-2xl text-center border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent appearance-none [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-inner-spin-button]:appearance-none"
                            />
                        )}
                        containerStyle="flex justify-center gap-2"
                    />
                    {otpError && (
                        <p className="text-red-500 text-center text-sm">
                            {otpError}
                        </p>
                    )}
                    <div className="flex gap-2 mt-4">
                        <button
                            type="button"
                            onClick={handleSubmitOtp}
                            disabled={otp.length !== 6}
                            className={`w-full bg-primary text-white py-2 rounded-lg transition ${
                                otp.length !== 6
                                    ? "opacity-50 cursor-not-allowed"
                                    : "hover:bg-primary-dark"
                            }`}>
                            Verify Code
                        </button>
                        <button
                            type="button"
                            onClick={handleVerifyEmail}
                            className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition">
                            Resend Code
                        </button>
                    </div>

                    {/* Mobile Number Pad Hint */}
                    <p className="text-center text-sm text-gray-500 md:hidden">
                        Numeric keypad will appear on mobile devices
                    </p>
                </div>
            </Modal>
        </div>
    );
};

export default CreateUser;
