'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { GraduationCap } from "lucide-react";

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">My Profile</h1>
        <div className="bg-white rounded-lg shadow p-8">
          <div className="flex items-center mb-4">
            <GraduationCap className="h-6 w-6 text-blue-500 mr-2" />
            <h2 className="text-xl font-semibold">Education</h2>
          </div>
          <p className="text-gray-600">Bachelor of Science in Computer Science</p>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
