'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function Settings() {
    const [username, setUsername] = useState('');
    const router = useRouter();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Get username from URL params first, then localStorage as fallback
        const urlUsername = searchParams?.get('username');
        if (urlUsername) {
            setUsername(urlUsername);
        } else {
            const storedUsername = localStorage.getItem('username');
            if (storedUsername) {
                setUsername(storedUsername);
            }
        }
    }, [searchParams]);

    const handleBackToCalendar = () => {
        // Set flag in sessionStorage before navigating back
        sessionStorage.setItem('fromSettings', 'true');
        router.push(`/welcome?username=${encodeURIComponent(username)}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
                <h1 className="text-2xl font-bold mb-6">Account Settings</h1>
                
                <div className="space-y-6">
                    <div>
                        <h2 className="text-lg font-semibold mb-2">Profile Information</h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="text-gray-600">Username: {username}</p>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-lg font-semibold mb-2">Preferences</h2>
                        <div className="bg-gray-50 p-4 rounded-md">
                            <p className="text-gray-500">More settings coming soon...</p>
                        </div>
                    </div>

                    <button
                        onClick={handleBackToCalendar}
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Back to Calendar
                    </button>
                </div>
            </div>
        </div>
    );
} 