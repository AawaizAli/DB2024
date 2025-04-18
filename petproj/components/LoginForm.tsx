"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { Button, Input } from "antd";

type LoginFormProps = {
    onSuccess: () => void;
    onClose?: () => void; // Make optional
};

export default function LoginForm({ onSuccess, onClose }: LoginFormProps) {
    const { login } = useAuth();
    const router = useRouter();

    const [user, setUser] = useState({
        email: "",
        password: "",
    });
    const [buttonDisabled, setButtonDisabled] = useState(true);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    useEffect(() => {
        setButtonDisabled(!(user.email && user.password));
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setUser((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await axios.post("/api/users/login", user);

            if (response.data.success) {
                const { id, name, email, role } = response.data.user;
                const userDetails = { id, name, email, role };

                localStorage.setItem("user", JSON.stringify(userDetails));
                login(userDetails);
                toast.success("Login successful!");
                onSuccess();
            }
        } catch (error: any) {
            console.error("Login failed:", error.message);
            toast.error(error.response?.data?.message || "Login failed!");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            setGoogleLoading(true);
            await signIn("google");
            onSuccess();
        } catch (error) {
            console.error("Google login failed:", error);
            toast.error("Google login failed. Please try again!");
        } finally {
            setGoogleLoading(false);
        }
    };

    return (
        <>
            <h2 className="text-3xl font-semibold mb-4 text-center">Login</h2>
            <p className="text-gray-600 text-center">
                Enter your credentials to access your account.
            </p>

            <form
                onSubmit={handleLogin}
                className="mt-8 w-full max-w-md bg-white shadow-lg rounded-2xl p-6 mx-auto">
                {/* Email Input */}
                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Email
                    </label>
                    <input
                        placeholder="Email"
                        type="email"
                        name="email"
                        value={user.email}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300  rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        required
                    />
                </div>

                {/* Password Input */}
                <div className="mb-6">
                    <label className="block text-gray-700 text-sm font-medium mb-2">
                        Password
                    </label>
                    <input
                        placeholder="Password"
                        type="password"
                        name="password"
                        value={user.password}
                        onChange={handleInputChange}
                        className="w-full  border border-gray-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-primary focus:outline-none"
                        required
                    />
                </div>

                {/* Login Button */}
                <button
                    type="submit"
                    disabled={buttonDisabled || loading}
                    className={`w-full py-2 px-4 rounded-xl text-white bg-primary hover:bg-primary-dark transition ${loading ? "opacity-50 cursor-not-allowed" : ""
                        }`}>
                    {loading ? "Logging in..." : "Log In"}
                </button>

                {/* Google Login */}
                <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                    className={`mt-4 w-full py-2 px-4 rounded-xl text-gray-600 border border-gray-400 hover:border-primary hover:text-primary transition flex items-center justify-center space-x-2 ${googleLoading ? "opacity-50 cursor-not-allowed" : ""
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
                            : "Login with Google"}
                    </span>
                </button>

                {/* Forgot Password */}
                <div className="mt-4 text-center">
                    <button
                        type="button"
                        className="text-primary hover:underline focus:outline-none"
                        onClick={() => router.push("/forgot-password")}>
                        Forgot Password?
                    </button>
                </div>

                {/* Create Account */}
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        New to Paltuu?{" "}
                        <button
                            type="button"
                            className="text-primary font-semibold hover:underline focus:outline-none"
                            onClick={() => router.push("/sign-up")}>
                            Create an account
                        </button>
                    </p>
                </div>
            </form>
        </>
    );
}