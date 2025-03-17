"use client";
import React, { useState, useEffect } from "react";
import Navbar from "@/components/navbar";
import { Spin, message } from "antd";
import { useSetPrimaryColor } from "@/app/hooks/useSetPrimaryColor";
import MoonLoader from "react-spinners/MoonLoader";

import "./page.css";

type Review = {
    review_id: number;
    user_id: number;
    user_name: string;
    user_image_url: string;
    rating: number;
    review_content: string;
    review_date: string;
};

const ReviewsSummary = () => {
    const [approvedReviews, setApprovedReviews] = useState<Review[]>([]);
    const [pendingReviews, setPendingReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [vetId, setVetId] = useState<number | null>(null);

    useSetPrimaryColor();

    useEffect(() => {
        const fetchVetIdAndReviews = async () => {
            setLoading(true);
            try {
                // Fetch userId from localStorage
                const userString = localStorage.getItem("user");
                if (!userString) {
                    throw new Error("User data not found in local storage");
                }

                const user = JSON.parse(userString);
                const userId = user?.id;
                if (!userId) {
                    throw new Error("User ID is missing from the user object");
                }

                // Fetch vetId using the userId
                const vetResponse = await fetch(`/api/get-vet-id?user_id=${userId}`);
                if (!vetResponse.ok) {
                    throw new Error(
                        `Failed to fetch vet ID. Status: ${vetResponse.status}`
                    );
                }

                const { vet_id } = await vetResponse.json();
                if (!vet_id) {
                    throw new Error("Vet ID not found for the user");
                }
                console.log(vet_id);
                setVetId(vet_id);

                // Fetch approved and pending reviews
                const approvedResponse = await fetch(
                    `/api/vet-reviews/approved-reviews/${vet_id}`
                );
                if (!approvedResponse.ok) {
                    throw new Error("Failed to fetch approved reviews");
                }
                const approvedData = await approvedResponse.json();
                setApprovedReviews(approvedData);

                const pendingResponse = await fetch(
                    `/api/vet-reviews/pending-reviews/${vet_id}`
                );
                if (!pendingResponse.ok) {
                    throw new Error("Failed to fetch pending reviews");
                }
                const pendingData = await pendingResponse.json();
                setPendingReviews(pendingData);
            } catch (error: unknown) {
                if (error instanceof Error) {
                    setError(error.message);
                    message.error(error.message);
                } else {
                    setError("An unknown error occurred");
                    message.error("An unknown error occurred");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchVetIdAndReviews();
    }, []);

    const acceptReview = async (review_id: number) => {
        try {
            const response = await fetch(
                `/api/vet-approve-review/${review_id}`,
                { method: "POST" }
            );

            if (response.ok) {
                message.success("Review approved successfully!");
                setPendingReviews((prev) =>
                    prev.filter((review) => review.review_id !== review_id)
                );
                const approvedReview = pendingReviews.find(
                    (review) => review.review_id === review_id
                );
                if (approvedReview) {
                    setApprovedReviews((prev) => [...prev, approvedReview]);
                }
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to approve review");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error("Error approving review: " + error.message);
            } else {
                message.error("An unknown error occurred");
            }
        }
    };

    const rejectReview = async (review_id: number) => {
        try {
            const response = await fetch(
                `/api/vet-reject-review/${review_id}`,
                { method: "DELETE" }
            );

            if (response.ok) {
                message.success("Review rejected and deleted successfully!");
                setPendingReviews((prev) =>
                    prev.filter((review) => review.review_id !== review_id)
                );
            } else {
                const data = await response.json();
                throw new Error(data.error || "Failed to reject review");
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                message.error("Error rejecting review: " + error.message);
            } else {
                message.error("An unknown error occurred");
            }
        }
    };

    const renderStars = (rating: number) =>
        Array(rating)
            .fill(null)
            .map((_, idx) => (
                <svg
                    key={idx}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 text-[#cc8800] inline-block"
                >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
            ));

    const renderReviewCard = (review: Review, isPending: boolean = false) => (
        <div
            key={review.review_id}
            className="flex items-start relative bg-white p-6 mb-6 rounded-2xl shadow-sm border border-gray-200 hover:border-primary w-4/5 max-w-3xl"
        >
            {/* User Image - Always Visible */}
            <img
                src={review.user_image_url || "/placeholder.jpg"}
                alt={review.user_name}
                className="w-16 h-16 object-cover rounded-full mr-4"
            />

            <div className="flex-grow">
                <div className="flex items-center justify-between">
                    {/* User Name - Always Visible */}
                    <span className="font-bold text-lg text-primary mr-2">
                        {review.user_name}
                        {isPending && (
                            <span className="text-sm text-gray-500 ml-2">
                                (Pending Approval)
                            </span>
                        )}
                    </span>

                    {/* Action Buttons - Always Visible */}
                    {isPending && (
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => acceptReview(review.review_id)}
                                className="hover:opacity-75"
                                aria-label="Accept Review"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6 text-primary"
                                >
                                    <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 22 6 20.6 4.6z" />
                                </svg>
                            </button>
                            <button
                                onClick={() => rejectReview(review.review_id)}
                                className="hover:opacity-75"
                                aria-label="Reject Review"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                    className="w-6 h-6 text-primary"
                                >
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13l-1.41 1.41L12 13.41 8.41 16.41 7 15l3.59-3.59L7 8.41 8.41 7l3.59 3.59L15.59 7 17 8.41l-3.59 3.59L17 15z" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                {/* Blurred Content for Pending Reviews */}
                <div className={isPending ? "filter blur-sm transition-all" : ""}>
                    {/* Rating Stars */}
                    <div className="stars">
                        {renderStars(isPending ? 5 : review.rating)}
                    </div>

                    {/* Review Content */}
                    <p className="text-gray-600 mb-2">"{review.review_content}"</p>

                    {/* Review Date */}
                    <p className="text-sm text-gray-400">
                        {new Date(review.review_date).toLocaleDateString()}
                    </p>
                </div>

                {/* Semi-transparent overlay for pending reviews */}
                {isPending && (
                    <div className="absolute inset-0 bg-white bg-opacity-40 pointer-events-none" />
                )}
            </div>
        </div>
    );

    const [primaryColor, setPrimaryColor] = useState("#A03048");
    useEffect(() => {
        const rootStyles = getComputedStyle(document.documentElement);
        const color = rootStyles.getPropertyValue("--primary-color").trim();
        if (color) {
            setPrimaryColor(color);
        }
    }, []);

    return (
        <div>
            <Navbar />
            <div className="flex flex-col min-h-screen items-center mt-5 mx-3">
                <h2 className="text-2xl font-bold mb-4 text-primary">Reviews Summary</h2>
                {loading ? (
                    <div className="flex justify-center items-center h-screen">
                        <MoonLoader size={30} color={primaryColor} />
                    </div>
                ) : (
                    <div className="w-full max-w-4xl">
                        <div>
                            <h3 className="text-xl font-semibold mb-3 text-center text-primary">
                                Approved Reviews
                            </h3>
                            <div className="flex flex-col items-center">
                                {approvedReviews.length > 0 ? (
                                    approvedReviews.map((review) =>
                                        renderReviewCard(review)
                                    )
                                ) : (
                                    <p className="text-primary">
                                        No approved reviews found.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="mt-8">
                            <h3 className="text-xl font-semibold mb-1 text-center text-primary">
                                Pending Reviews
                            </h3>
                            <h5 className="text-sm font-semibold text-center text-primary">
                                Approve if you recall them availing your services.
                            </h5>
                            <h6 className="text-sm font-semibold mb-3 text-center text-primary">
                                Once approved, the review will stay on your profile.
                            </h6>
                            <div className="flex flex-col items-center">
                                {pendingReviews.length > 0 ? (
                                    pendingReviews.map((review) =>
                                        renderReviewCard(review, true)
                                    )
                                ) : (
                                    <p className="text-primary mb-4">
                                        No pending reviews found.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReviewsSummary;
