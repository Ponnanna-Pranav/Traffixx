import React, { useState, useEffect } from 'react';
import client from '../api/client';

export default function AdminDashboard() {
    const [users, setUsers] = useState([]);
    const [rides, setRides] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, ridesRes] = await Promise.all([
                    client.get('/admin/users'),
                    client.get('/admin/rides')
                ]);
                setUsers(usersRes.data);
                setRides(ridesRes.data);
            } catch (err) {
                console.error("Error fetching admin data", err);
            }
        };
        fetchData();
    }, []);

    return (
        <div className="w-full max-w-6xl space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">System Metrics</h2>
                    <div className="space-y-2">
                        <p className="text-gray-600">Total Users: <span className="font-bold text-gray-900">{users.length}</span></p>
                        <p className="text-gray-600">Total Rides: <span className="font-bold text-gray-900">{rides.length}</span></p>
                        <p className="text-gray-600">Total Revenue: <span className="font-bold text-green-600">₹{rides.reduce((acc, ride) => acc + (ride.fare || 0), 0).toFixed(2)}</span></p>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-md p-6 overflow-auto max-h-96">
                    <h2 className="text-xl font-semibold mb-4 text-gray-800">Users</h2>
                    <table className="min-w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">ID</th>
                                <th className="px-4 py-2">Name</th>
                                <th className="px-4 py-2">Role</th>
                                <th className="px-4 py-2">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => (
                                <tr key={u.id} className="bg-white border-b">
                                    <td className="px-4 py-2">{u.id}</td>
                                    <td className="px-4 py-2">{u.name}</td>
                                    <td className="px-4 py-2 font-medium">{u.role}</td>
                                    <td className="px-4 py-2">{u.email}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 overflow-auto max-h-96">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">All Rides</h2>
                <table className="min-w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th className="px-4 py-2">Ride ID</th>
                            <th className="px-4 py-2">Rider</th>
                            <th className="px-4 py-2">Driver</th>
                            <th className="px-4 py-2">Status</th>
                            <th className="px-4 py-2">Fare</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rides.map(r => (
                            <tr key={r.id} className="bg-white border-b">
                                <td className="px-4 py-2">{r.id}</td>
                                <td className="px-4 py-2">{r.rider?.name || 'Unknown'}</td>
                                <td className="px-4 py-2">{r.driver?.name || 'Unassigned'}</td>
                                <td className="px-4 py-2 font-semibold text-blue-600">{r.status}</td>
                                <td className="px-4 py-2">${r.fare}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
