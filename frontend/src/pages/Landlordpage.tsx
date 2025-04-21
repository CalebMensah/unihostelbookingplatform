// src/components/LandlordUploadForm.tsx
import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const LandlordUploadForm: React.FC = () => {
    // State for form data
    const [formData, setFormData] = useState({
        documentType: "",
        id_number: "",
        bank_name: "",
        account_number: "",
        account_type: "",
        account_name: "",
    });

    // State for uploaded files
    const [files, setFiles] = useState({
        proofOfProperty: null as File | null,
        utilityBills: null as File | null,
        businessRegistration: null as File | null,
    });
    const navigate = useNavigate()

    // Handle changes in text inputs and select dropdowns
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle file input changes
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, files } = e.target;
        if (files && files[0]) {
            setFiles((prev) => ({ ...prev, [name]: files[0] }));
        }
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Create FormData object to send multipart/form-data
        const formDataToSend = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            formDataToSend.append(key, value);
        });
        Object.entries(files).forEach(([key, file]) => {
            if (file) formDataToSend.append(key, file);
        });

        try {
            // Send POST request to the backend
            const response = await axios.post("/api/hostels/upload-documents", formDataToSend, {
                headers: { 
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                    "Content-Type": "multipart/form-data" },
            });
            toast.success(response.data.message); // Show success message
            navigate("/manager-dashboard") // Redirect to dashboard
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload documents"); // Show error message
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg space-y-4">
                {/* Document Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Document Type</label>
                    <select
                        name="documentType"
                        value={formData.documentType}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    >
                        <option value="">Select Document Type</option>
                        <option value="Ghana Card">Ghana Card</option>
                        <option value="Voters ID">Voters ID</option>
                        <option value="Drivers License">Drivers License</option>
                    </select>
                </div>

                {/* ID Number */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">ID Number</label>
                    <input
                        type="text"
                        name="id_number"
                        value={formData.id_number}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Proof of Property */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Proof of Property</label>
                    <input
                        type="file"
                        name="proofOfProperty"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                {/* Utility Bills */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Utility Bills</label>
                    <input
                        type="file"
                        name="utilityBills"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                {/* Business Registration */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Business Registration</label>
                    <input
                        type="file"
                        name="businessRegistration"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                    />
                </div>

                {/* Bank Details */}
                <div>
                    <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                    <input
                        type="text"
                        name="bank_name"
                        value={formData.bank_name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Number</label>
                    <input
                        type="text"
                        name="account_number"
                        value={formData.account_number}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Type</label>
                    <input
                        type="text"
                        name="account_type"
                        value={formData.account_type}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Account Name</label>
                    <input
                        type="text"
                        name="account_name"
                        value={formData.account_name}
                        onChange={handleChange}
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                    Upload Documents
                </button>
            </form>
        </div>
    );
};

export default LandlordUploadForm;