"use client";
import React from "react";
import Link from "next/link"; // Import Link from next/link
import { useSetPrimaryColor } from "@/app/hooks/useSetPrimaryColor";
import "./petGrid.css"; // Assuming the same styles are used for consistency

interface LostAndFoundPet {
    post_id: number;
    user_id: number;
    post_type: string;
    pet_description: string;
    city_id: number;
    location: string;
    contact_info: string;
    post_date: string;
    status: string;
    category_id: number;
    image_url: string | null;
    city: string; // Assuming city name is part of the data
    category_name: string; // Assuming category name is part of the data
}

interface LostAndFoundGridProps {
    pets: LostAndFoundPet[];
}

const LostAndFoundGrid: React.FC<LostAndFoundGridProps> = ({ pets }) => {
    useSetPrimaryColor();

    // Log the pets data to check if it is passed correctly
    console.log("Pets Data:", pets);

    // Check if pets array is empty
    if (pets.length === 0) {
        return <p>No lost or found pets available at the moment.</p>;
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            <Link
                href="/lost-and-found-create-listing"
                className="create-listing-btn bg-white text-primary p-4 rounded-3xl shadow-sm overflow-hidden flex  flex-col items-center justify-center border-2 border-transparent hover:border-primary hover:scale-102 transition-all duration-300">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    fill="currentColor"
                    className="bi bi-flag mb-3"
                    viewBox="0 0 16 16">
                    <path d="M14.778.085A.5.5 0 0 1 15 .5V8a.5.5 0 0 1-.314.464L14.5 8l.186.464-.003.001-.006.003-.023.009a12 12 0 0 1-.397.15c-.264.095-.631.223-1.047.35-.816.252-1.879.523-2.71.523-.847 0-1.548-.28-2.158-.525l-.028-.01C7.68 8.71 7.14 8.5 6.5 8.5c-.7 0-1.638.23-2.437.477A20 20 0 0 0 3 9.342V15.5a.5.5 0 0 1-1 0V.5a.5.5 0 0 1 1 0v.282c.226-.079.496-.17.79-.26C4.606.272 5.67 0 6.5 0c.84 0 1.524.277 2.121.519l.043.018C9.286.788 9.828 1 10.5 1c.7 0 1.638-.23 2.437-.477a20 20 0 0 0 1.349-.476l.019-.007.004-.002h.001M14 1.221c-.22.078-.48.167-.766.255-.81.252-1.872.523-2.734.523-.886 0-1.592-.286-2.203-.534l-.008-.003C7.662 1.21 7.139 1 6.5 1c-.669 0-1.606.229-2.415.478A21 21 0 0 0 3 1.845v6.433c.22-.078.48-.167.766-.255C4.576 7.77 5.638 7.5 6.5 7.5c.847 0 1.548.28 2.158.525l.028.01C9.32 8.29 9.86 8.5 10.5 8.5c.668 0 1.606-.229 2.415-.478A21 21 0 0 0 14 7.655V1.222z" />
                </svg>
                Report Lost/Found
            </Link>
            {pets.map((pet) => (
                <div className="bg-white p-4 rounded-3xl shadow-sm overflow-hidden border-2 border-transparent hover:border-primary hover:scale-102 transition-all duration-300">
                    <div className="relative">
                        <img
                            src={pet.image_url || "./dog-placeholder.png"} // Fallback image if pet.image_url is null
                            alt={pet.pet_description || "Lost or Found Pet"} // Improved alt text
                            className="w-full h-48 object-cover rounded-2xl"
                        />
                    </div>
                    <div className="p-4">
                        <h3 className="font-bold text-xl mb-2">
                            {pet.category_name}
                        </h3>
                        <p className="text-gray-600 mb-1">
                            {pet.city} - {pet.location}
                        </p>
                        {pet.pet_description && (
                            <p className="text-gray-600 mb-1 truncate">
                                {pet.pet_description}
                            </p>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default LostAndFoundGrid;
