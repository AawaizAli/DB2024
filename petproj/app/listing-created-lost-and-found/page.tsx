"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";

const ListingCreated = () => {
    return (
        <>
            <Navbar />
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 py-10 ">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <h1 className="text-3xl font-semibold text-primary mb-4">Listing Created Successfully!</h1>
                    <p className="text-lg text-gray-700 mb-6">
                        Your Lost & Found listing has been created and is now public! 
                        We are thankful for your contribution to our community.
                    </p>
                    <div className="flex justify-center gap-4">
                        <button
                            onClick={() => window.location.href = "/lost-and-found"}
                            className="px-6 py-2 bg-primary text-white rounded-xl hover:bg-primary transition-all duration-300"
                        >
                            View Lost & Found
                        </button>
                        <button
                            onClick={() => window.location.href = "/browse-pets"}
                            className="px-6 py-2 bg-white text-primary rounded-xl border border-primary transition-all duration-300"
                        >
                            Go Back to Home Page
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ListingCreated;

