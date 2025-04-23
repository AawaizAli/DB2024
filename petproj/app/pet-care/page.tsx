// PetCare Component
"use client";
import { useEffect, useState } from "react";
import Navbar from "../../components/navbar";
import VetFilterSection from "../../components/VetFilterSection";
import VetGrid from "../../components/VetGrid";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "../store/store";
import { fetchVets } from "../store/slices/vetSlice";
import { MoonLoader } from "react-spinners";

export default function PetCare() {
    const dispatch = useDispatch<AppDispatch>();
    const { vets, loading, error } = useSelector(
        (state: RootState) => state.vets
    );

    const [filters, setFilters] = useState({
        selectedCity: "",
        selectedCategory: "", // Combined filter for specialization
        selectedQualification: "",
    });

    const [primaryColor, setPrimaryColor] = useState("#000000"); // Default fallback color

    useEffect(() => {
        // Get the computed style of the `--primary-color` CSS variable
        const rootStyles = getComputedStyle(document.documentElement);
        const color = rootStyles.getPropertyValue("--primary-color").trim();
        if (color) {
            setPrimaryColor(color);
        }
    }, []);

    useEffect(() => {
        // Dispatch fetchVets when component mounts
        dispatch(fetchVets());
    }, [dispatch]);

    const handleReset = () => {
        // console.log("Resetting filters");s
        setFilters({
            selectedCity: "1",
            selectedCategory: "",
            selectedQualification: "",
        });
    };

    const handleSearch = () => {
        console.log("Searching with filters:", filters);
    };

    // Filter vets based on the current filters
    const filteredVets = vets.filter((vet) => {
        // Log the current vet being checked
        // console.log(`Checking vet: ${vet.name}`);

        // console.log("Current filters:", filters);

        const matchesCity = filters.selectedCity
            ? vet.city_id === parseInt(filters.selectedCity)
            : true;
        console.log(
            `Vet ${vet.name} matches city (${vet.city_id}):`,
            matchesCity
        );

        const matchesSpecialization = filters.selectedCategory
            ? vet.specializations.some((spec) => {
                const match =
                    spec.category_id === parseInt(filters.selectedCategory);
                console.log(
                    `  - Specialization: ${spec.category_id} matches:`,
                    match
                );
                return match;
            })
            : true;
        console.log(
            `Vet ${vet.name} matches specialization:`,
            matchesSpecialization
        );

        const matchesQualification = filters.selectedQualification
            ? vet.qualifications.some((qual) => {
                const match =
                    qual.qualification_id ===
                    parseInt(filters.selectedQualification);
                console.log(
                    `  - Qualification ID: ${qual.qualification_id} matches:`,
                    match
                );
                return match;
            })
            : true;
        console.log(
            `Vet ${vet.name} matches qualification:`,
            matchesQualification
        );

        // Final filter result for each vet
        const matchesAll =
            matchesCity && matchesSpecialization && matchesQualification;
        console.log(`Vet ${vet.name} matches all filters:`, matchesAll);
        return matchesAll;
    });

    // console.log("Filtered Vets:", filteredVets); // Log the final filtered vets

    return (
        <>
            <Navbar />
            <div
                className="fullBody"
                style={{ maxWidth: "90%", margin: "0 auto" }}>
                <VetFilterSection
                    onSearch={(newFilters) => {
                        // console.log("Updating filters:", newFilters);
                        setFilters((prevFilters) => ({
                            ...prevFilters,
                            ...newFilters,
                        }));
                    }}
                    onReset={handleReset}
                    onSearchAction={handleSearch}
                />
                <main className="flex min-h-screen flex-col mx-0 md:mx-8 mt-1 items-center pt-7 bg-gray-100">
                    <div className="w-full">
                        {loading ? (
                            <MoonLoader className="mt-5 mx-auto relative top-5" size={30} color={primaryColor} />
                        ) : error ? (
                            <p>Error: {error}</p>
                        ) : (
                            <VetGrid vets={filteredVets} />
                        )}
                    </div>
                </main>
            </div>
        </>
    );
}
