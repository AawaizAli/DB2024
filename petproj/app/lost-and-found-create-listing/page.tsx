"use client";

import { useState, useEffect } from "react";
import "./styles.css";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import { useSetPrimaryColor } from "../hooks/useSetPrimaryColor";
import LoginModal from "@/components/LoginModal"; // Import your login modal component

const LostFoundListingPage = () => {
    const [categoryId, setCategoryId] = useState<number | string>(""); // Updated to categoryId
    const [cityId, setCityId] = useState("");
    const [location, setLocation] = useState("");
    const [description, setDescription] = useState(""); // **Pet Description field**
    const [date, setDate] = useState("");
    const [contactInfo, setContactInfo] = useState("");
    const [activeTab, setActiveTab] = useState<"lost" | "found">("lost");
    const [userId, setUserId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [showLoginModal, setShowLoginModal] = useState(false);
    useSetPrimaryColor();
    const router = useRouter();
    // **Retrieve user ID from localStorage**
    useEffect(() => {
        const checkUser = () => {
            const userString = localStorage.getItem("user");
            if (!userString) {
                setShowLoginModal(true);
                return;
            }

            try {
                const user = JSON.parse(userString);
                const user_id = user?.id;
                if (!user_id) {
                    setShowLoginModal(true);
                    return;
                }
                setUserId(user_id);
            } catch (error) {
                setShowLoginModal(true);
            }
        };

        checkUser();
    }, []);

    // **City Options**
    const cities = [
        { id: 1, name: "Karachi" },
        { id: 2, name: "Islamabad" },
        { id: 3, name: "Lahore" },
    ];

    // **Pet Categories**
    const petCategories = [
        { id: 1, name: "Dog" },
        { id: 2, name: "Cat" },
        { id: 3, name: "Bird" },
        { id: 4, name: "Fish" },
        { id: 5, name: "Rabbit" },
        { id: 6, name: "Hamster" },
        { id: 7, name: "Guinea Pig" },
        { id: 8, name: "Turtle" },
        { id: 11, name: "Horse" },
        { id: 15, name: "Mouse" },
    ];

    // **Handle form submission**
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!userId) {
            setShowLoginModal(true);
            return;
        }

        setLoading(true);
        setError(null);

        // Collect the form data
        const formData = {
            category_id: categoryId, // Convert to integer
            city_id: parseInt(cityId), // Convert to integer
            location: location,
            pet_description: description || null, // **Include pet description** (optional field)
            date: activeTab === "lost" ? date : null, // Only include date_lost if "Lost" is active
            contact_info: contactInfo,
            post_type: activeTab, // This will be either "lost" or "found"
            user_id: userId, // **User ID is added here**
        };

        console.log('Form Data:', formData); // Debugging log

        const handleLoginSuccess = () => {
            setShowLoginModal(false);
            // Re-check user after successful login
            const userString = localStorage.getItem("user");
            if (userString) {
                const user = JSON.parse(userString);
                setUserId(user?.id);
            }
        };


        try {
            const response = await fetch("/api/lost-and-found", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                console.log("Success:", data);

                // Assuming the response contains a post_id
                const postId = data?.post_id;
                if (postId) {
                    router.push(`/lost-and-found-images?post_id=${postId}`);
                } else {
                    setError("Failed to get post ID from response.");
                }

                resetForm();
            } else {
                setError(data?.message || "Failed to submit listing");
            }
        } catch (error) {
            setError("An error occurred while submitting the listing");
        } finally {
            setLoading(false);
        }
    };

    // **Reset form fields**
    const resetForm = () => {
        setCategoryId("");
        setCityId("");
        setLocation("");
        setDescription(""); // Reset pet description
        setDate("");
        setContactInfo("");
    };

    // **Toggle between Lost and Found tabs**
    const handleTabToggle = (tab: "lost" | "found") => {
        setActiveTab(tab);
    };

    const handleLoginSuccess = () => {
        setShowLoginModal(false);
        // Re-check user after successful login
        const userString = localStorage.getItem("user");
        if (userString) {
            const user = JSON.parse(userString);
            setUserId(user?.id);
        }
    };

    return (
        <>
            <LoginModal
  visible={showLoginModal}
  onSuccess={handleLoginSuccess}
  onClose={() => setShowLoginModal(false)}
  mandatory // Add this prop to make it non-closable
/>
            <Navbar />
            <div
                className="fullBody"
                style={{ maxWidth: "90%", margin: "0 auto" }}
            >
                <form
                    className="bg-white p-6 rounded-3xl shadow-md w-full max-w-lg mx-auto my-8"
                    onSubmit={handleSubmit}
                >
                    {error && <p className="text-red-500 mb-4">{error}</p>}

                    {/* Tab Switch */}
                    <div className="tab-switch-container mb-6">
                        <div
                            className="tab-switch-slider bg-primary"
                            style={{
                                transform: activeTab === "lost" ? "translateX(0)" : "translateX(100%)",
                            }}
                        />
                        <div
                            className={`tab ${activeTab === "lost" ? "active" : ""}`}
                            onClick={() => handleTabToggle("lost")}
                        >
                            Lost
                        </div>
                        <div
                            className={`tab ${activeTab === "found" ? "active" : ""}`}
                            onClick={() => handleTabToggle("found")}
                        >
                            Found
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Pet Category</label>
                        <select
                            className="mt-1 p-3 w-full border rounded-2xl"
                            value={categoryId}
                            required
                            onChange={(e) => setCategoryId(e.target.value)}
                        >
                            <option value="">Select pet category</option>
                            {petCategories.map((category) => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">City</label>
                        <select
                            className="mt-1 p-3 w-full border rounded-2xl"
                            value={cityId}
                            required
                            onChange={(e) => setCityId(e.target.value)}
                        >
                            <option value="">Select city</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Location</label>
                        <input
                            type="text"
                            className="mt-1 p-3 w-full border rounded-2xl"
                            placeholder="Enter specific location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Pet Description</label>
                        <textarea
                            className="mt-1 p-3 w-full border rounded-2xl"
                            placeholder="Enter details about the pet"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                        />
                    </div>

                    {/* Show "Date Lost" if Lost tab is active */}
                    {activeTab === "lost" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Date Lost</label>
                            <input
                                type="date"
                                className="mt-1 p-3 w-full border rounded-2xl"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    )}

                    {/* Show "Date Found" if Found tab is active */}
                    {activeTab === "found" && (
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700">Date Found</label>
                            <input
                                type="date"
                                className="mt-1 p-3 w-full border rounded-2xl"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                            />
                        </div>
                    )}

                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">Contact Info</label>
                        <input
                            type="text"
                            required
                            className="mt-1 p-3 w-full border rounded-2xl"
                            placeholder="Enter contact details"
                            value={contactInfo}
                            onChange={(e) => setContactInfo(e.target.value)}
                        />
                    </div>

                    <button
                        type="submit"
                        className="mt-4 p-3 bg-primary text-white rounded-3xl w-full"
                        disabled={loading}
                    >
                        {loading ? "Submitting..." : "Submit Listing"}
                    </button>
                </form>
            </div>
        </>
    );
};

export default LostFoundListingPage;
