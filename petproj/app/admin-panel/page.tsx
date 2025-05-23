"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { useSetPrimaryColor } from "../hooks/useSetPrimaryColor";
import Link from "next/link";
import Image from "next/image";

interface UserProfileData {
    user_id: string;
    name: string;
    dob: string;
    email: string;
    profile_image_url: string;
    city: string;
    created_at: string;
}

const AdminPanel = () => {
    useSetPrimaryColor();

    useSetPrimaryColor();
    const [userId, setUserId] = useState<string | null>(null);
    const [data, setData] = useState<UserProfileData | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        // Get user_id from local storage
const storedUser = localStorage.getItem("user");
if (!storedUser) {
    console.error("No user data found in local storage.");
    setLoading(false);
    return;
}

const parsedUser = JSON.parse(storedUser);
const userId = parsedUser?.id;
if (!userId) {
    console.error("User ID is missing in the stored user data.");
    setLoading(false);
    return;
}

console.log(`Fetched user ID: ${userId}`);

        // Fetch user profile
        const fetchUserProfile = async () => {
            setLoading(true);
            try {
                const res = await fetch(`/api/my-profile/${userId}`);
                if (!res.ok) {
                    throw new Error(
                        `Failed to fetch user data. Status: ${res.status}`
                    );
                }
                const responseData: UserProfileData = await res.json();
                console.log(responseData)
                setData(responseData);
            } catch (error) {
                console.error("Error fetching user profile data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, []);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="loader"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p className="text-red-600">
                    Error loading data. Please try again later.
                </p>
            </div>
        );
    }

    const { name, dob, email, profile_image_url, city, created_at } = data;

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 min-h-screen px-6 py-8">
                {/* Personal Info Box */}
                <div className="bg-white shadow-lg rounded-lg p-6 mb-6 relative border border-gray-200 hover:border-primary">
                    <button
                        className="absolute top-4 right-4 w-6 h-6"
                        title="Edit Personal Info">
                        <img src="/pen.svg" alt="Edit" />
                    </button>
                    <h3 className="text-xl font-bold mb-4 text-primary">
                        Personal Information
                    </h3>
                    <div className="flex gap-4">
                        <img
                            className="w-24 h-24 rounded-full shadow-md"
                            src={profile_image_url || "/placeholder.jpg"}
                            alt={name}
                        />
                        <div>
                            <p>
                                <span className="font-bold">Name:</span> {name}
                            </p>
                            <p className="mt-2">
                                <span className="font-bold">Email:</span> {email}
                            </p>
                            <p className="mt-2">
                                <span className="font-bold">City:</span> {city}
                            </p>
                            <p className="mt-2">
                                <span className="font-bold">Date of Birth:</span>{" "}
                                {dob}
                            </p>
                            <p className="mt-2">
                                <span className="font-bold">Joined:</span>{" "}
                                {new Date(created_at).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>


                {/* 2x2 Grid for Smaller Cards */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Pets */}
                    <Link href="/admin-pet">
                        <div className="bg-white shadow-lg rounded-lg p-6 relative border border-gray-200 hover:border-primary">
                            <button
                                className="absolute top-4 right-4 w-6 h-6"
                                title="Edit Pets">
                                <img
                                    src="/arrow-right.svg"
                                    alt="Details"
                                    className="hover:text-primary"
                                />
                            </button>

                            <h4 className="text-lg font-bold text-primary mb-4">
                                Go to Pets
                            </h4>
                            {/* Content for Pets */}
                        </div>
                    </Link>

                    {/* Vets */}
                    <Link href="/admin-pet-approval">
                    <div className="bg-white shadow-lg rounded-lg p-6 relative border border-gray-200 hover:border-primary">
                        <button
                            className="absolute top-4 right-4 w-6 h-6"
                            title="Edit Vets">
                            <img
                                src="/arrow-right.svg"
                                alt="Details"
                                className="hover:text-primary"
                            />
                        </button>
                        <h4 className="text-lg font-bold text-primary mb-4">
                            Go to Listing Approvals
                        </h4>
                        {/* Content for Vets */}
                    </div>
                    </Link>

                    {/* Users */}
                    <Link href="/admin-user">
                        <div className="bg-white shadow-lg rounded-lg p-6 relative border border-gray-200 hover:border-primary">
                            <div className="absolute top-4 right-4 w-6 h-6">
                                <img
                                    src="/arrow-right.svg"
                                    alt="Details"
                                    className="hover:text-primary text-primary"
                                />
                            </div>
                                <h4 className="text-lg font-bold text-primary mb-4">
                                    Go to Users
                                </h4>

                            {/* Content for Users */}
                        </div>
                    </Link>

                    {/* Verification Applications */}
                    <Link href="/admin-approve-vets">
                    <div className="bg-white shadow-lg rounded-lg p-6 relative border border-gray-200 hover:border-primary">
                        <button
                            className="absolute top-4 right-4 w-6 h-6"
                            title="Edit Verification Applications">
                            <img
                                src="/arrow-right.svg"
                                alt="Details"
                                className="hover:text-primary"
                            />
                        </button>
                        <h4 className="text-lg font-bold text-primary mb-4">
                            Go to Verification Applications
                        </h4>
                        {/* Content for Verification Applications */}
                    </div>
                    </Link>
                </div>
            </div>
        </>
    );
};

export default AdminPanel;
