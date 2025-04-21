import React, { useEffect, useState } from "react";
import axios from "axios";
import { 
    ChevronLeftIcon, 
    ChevronRightIcon 
} from "lucide-react";

interface User { 
    userid: string;
    firstname: string; 
    lastname: string; 
    phone: string; 
    room_number: string 
}

interface Pagination {
    currentPage: number;
    totalPages: number;
    totalStudents: number;
    pageSize: number;
}

const StudentsPage: React.FC = () => { 
    const [students, setStudents] = useState<User[]>([]); 
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<Pagination>({
        currentPage: 1,
        totalPages: 1,
        totalStudents: 0,
        pageSize: 10
    });
    const API_URL = import.meta.env.API_URL;

    const fetchUsers = async (page = 1) => { 
        try { 
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/auth/users`, {
                params: { page, limit: 10 }
            }); 
            setStudents(response.data.students);
            setPagination(response.data.pagination);
        } catch (error) { 
            console.error(error); 
            alert("Failed to fetch users"); 
        } finally { 
            setLoading(false);
        }
    }; 

    useEffect(() => {
        fetchUsers(); 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    const handlePageChange = (newPage: number) => {
        fetchUsers(newPage);
    };

    if (loading) { 
        return ( 
            <div className="flex items-center justify-center min-h-screen bg-gray-50"> 
                <div className="text-center"> 
                    <div className="w-16 h-16 border-4 border-t-blue-600 border-gray-200 rounded-full animate-spin mx-auto"></div> 
                    <p className="mt-4 text-lg text-gray-700">Loading students...</p> 
                </div> 
            </div> 
        ); 
    } 

    return ( 
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8"> 
            <div className="max-w-7xl mx-auto"> 
                <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-gray-800">
                    Students Dashboard
                </h1> 

                {/* Students Table */}
                <div className="bg-white shadow-md rounded-lg overflow-hidden"> 
                    <div className="overflow-x-auto">
                        <table className="w-full"> 
                            <thead className="bg-gray-100 border-b"> 
                                <tr> 
                                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">User ID</th> 
                                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">First Name</th> 
                                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Last Name</th> 
                                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Phone</th> 
                                    <th className="py-3 px-4 text-left text-xs sm:text-sm font-medium text-gray-600 uppercase tracking-wider">Room</th> 
                                </tr> 
                            </thead> 
                            <tbody className="divide-y divide-gray-200"> 
                                {students.length > 0 ? ( 
                                    students.map((student) => ( 
                                        <tr key={student.userid} className="hover:bg-gray-50 transition-colors"> 
                                            <td className="py-4 px-4 text-sm text-gray-900">{student.userid}</td> 
                                            <td className="py-4 px-4 text-sm text-gray-900">{student.firstname}</td> 
                                            <td className="py-4 px-4 text-sm text-gray-900">{student.lastname}</td> 
                                            <td className="py-4 px-4 text-sm text-gray-900">{student.phone}</td> 
                                            <td className="py-4 px-4 text-sm text-gray-900">{student.room_number}</td> 
                                        </tr> 
                                    )) 
                                ) : ( 
                                    <tr> 
                                        <td colSpan={5} className="py-4 text-center text-gray-500"> 
                                            No students found 
                                        </td> 
                                    </tr> 
                                )} 
                            </tbody> 
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6"> 
                        <div className="flex-1 flex justify-between sm:hidden"> 
                            <button 
                                onClick={() => handlePageChange(pagination.currentPage - 1)} 
                                disabled={pagination.currentPage === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button> 
                            <button 
                                onClick={() => handlePageChange(pagination.currentPage + 1)} 
                                disabled={pagination.currentPage === pagination.totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button> 
                        </div> 
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between"> 
                            <div> 
                                <p className="text-sm text-gray-700"> 
                                    Showing{' '} 
                                    <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span>{' '}
                                    to{' '} 
                                    <span className="font-medium">
                                        {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalStudents)}
                                    </span>{' '}
                                    of{' '} 
                                    <span className="font-medium">{pagination.totalStudents}</span>{' '}
                                    students 
                                </p> 
                            </div> 
                            <div> 
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination"> 
                                    <button 
                                        onClick={() => handlePageChange(pagination.currentPage - 1)} 
                                        disabled={pagination.currentPage === 1}
                                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    > 
                                        <span className="sr-only">Previous</span> 
                                        <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" /> 
                                    </button> 
                                    {[...Array(pagination.totalPages)].map((_, index) => ( 
                                        <button 
                                            key={index} 
                                            onClick={() => handlePageChange(index + 1)}
                                            className={`relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium 
                                                ${pagination.currentPage === index + 1 
                                                    ? 'z-10 bg-blue-50 border-blue-500 text-blue-600' 
                                                    : 'text-gray-500 hover:bg-gray-50'
                                                }`}
                                        > 
                                            {index + 1} 
                                        </button> 
                                    ))} 
                                    <button 
                                        onClick={() => handlePageChange(pagination.currentPage + 1)} 
                                        disabled={pagination.currentPage === pagination.totalPages}
                                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                    > 
                                        <span className="sr-only">Next</span> 
                                        <ChevronRightIcon className="h-5 w-5" aria-hidden="true" /> 
                                    </button> 
                                </nav> 
                            </div> 
                        </div> 
                    </div> 
                </div> 
            </div> 
        </div> 
    ); 
}; 

export default StudentsPage;