
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Loader2 } from "lucide-react";

// Define the User Interface
interface User {
  userid?: string; // Optional since landlords don't have this field
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  Properties?: string; // Optional since students don't have this field
  hostel_name?: string; // Added for landlords
  location?: string; // Added for landlords
}

const UsersPage = () => {
  // State Management
  const [students, setStudents] = useState<User[]>([]);
  const [landlords, setLandlords] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"students" | "landlords">("students");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");

  const API_URL = import.meta.env.API_URL;

  // Pagination States
  const [studentPage, setStudentPage] = useState(1);
  const [landlordPage, setLandlordPage] = useState(1);
  const [studentPagination, setStudentPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });
  const [landlordPagination, setLandlordPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  });

  // Column Mapping for Table
  const columnMapping: { [key: string]: keyof User } = {
    "User ID": "userid",
    "First Name": "firstname",
    "Last Name": "lastname",
    "Email": "email",
    "Phone": "phone",
    "Properties": "Properties",
    "Hostel Name": "hostel_name",
    "Location": "location",
  };

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const fetchUsers = async (type: "students" | "landlords") => {
          const response = await axios.get(`${API_URL}/api/admin/users`, {
            params: {
              type,
              page: type === "students" ? studentPage : landlordPage,
              limit: 10,
              search: searchTerm,
              sortBy: "lastname",
              sortOrder: "asc",
            },
          });

          console.log("API Response:", response.data); // Log the response for debugging

          // Validate the response structure
          if (!response.data || !response.data[type] || !response.data[type].data) {
            throw new Error("Invalid API response format");
          }

          // Update state based on the response
          if (type === "students") {
            setStudents(response.data.students.data);
            setStudentPagination(response.data.students.pagination);
          } else {
            setLandlords(response.data.landlords.data);
            setLandlordPagination(response.data.landlords.pagination);
          }
        };

        await Promise.all([
          fetchUsers("students"),
          fetchUsers("landlords"),
        ]);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch users. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [studentPage, landlordPage, searchTerm, API_URL]);

  // Render Pagination
  const renderPagination = (
    pagination: { currentPage: number; totalPages: number },
    setPage: React.Dispatch<React.SetStateAction<number>>
  ) => {
    return (
      <div className="flex justify-center items-center space-x-2 mt-4">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={pagination.currentPage === 1}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          Previous
        </button>
        <div className="flex space-x-1">
          {[...Array(pagination.totalPages)].map((_, index) => (
            <button
              key={`page-${index + 1}`}
              onClick={() => setPage(index + 1)}
              className={`px-3 py-2 rounded-md transition-colors ${
                pagination.currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <button
          onClick={() =>
            setPage((prev) => Math.min(prev + 1, pagination.totalPages))
          }
          disabled={pagination.currentPage === pagination.totalPages}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
        >
          Next
        </button>
      </div>
    );
  };

  // Render User Table
  const renderUserTable = (users: User[], columns: string[]) => {
    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className="p-3 text-left text-gray-600 font-semibold"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length > 0 ? (
              users.map((user) => (
                <tr
                  key={user.userid || user.hostel_name} // Use a unique identifier for each row
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  {columns.map((column, columnIndex) => (
                    <td key={columnIndex} className="p-3 text-gray-700">
                      {user[columnMapping[column]] || "N/A"}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="text-center p-4 text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Render Search Input
  const renderSearchInput = () => (
    <div className="mb-4">
      <input
        type="text"
        placeholder="Search users..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          if (activeTab === "students") {
            setStudentPage(1); // Reset pagination when searching
          } else {
            setLandlordPage(1);
          }
        }}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-lg text-gray-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="w-full max-w-7xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 bg-gray-100 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">Users Management</h2>
        </div>
        <div className="p-4">
          {/* Tabs */}
          <div className="flex border-b mb-4">
            <button
              onClick={() => setActiveTab("students")}
              className={`px-4 py-2 font-semibold ${
                activeTab === "students"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Students
            </button>
            <button
              onClick={() => setActiveTab("landlords")}
              className={`px-4 py-2 font-semibold ${
                activeTab === "landlords"
                  ? "border-b-2 border-blue-600 text-blue-600"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              Landlords
            </button>
          </div>
          {renderSearchInput()}
          {activeTab === "students" ? (
            <>
              {renderUserTable(students, [
                "User ID",
                "First Name",
                "Last Name",
                "Email",
                "Phone",
              ])}
              {students.length > 0 &&
                renderPagination(studentPagination, setStudentPage)}
            </>
          ) : (
            <>
              {renderUserTable(landlords, [
                "Hostel Name",
                "First Name",
                "Last Name",
                "Email",
                "Phone",
                "Location",
              ])}
              {landlords.length > 0 &&
                renderPagination(landlordPagination, setLandlordPage)}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersPage;