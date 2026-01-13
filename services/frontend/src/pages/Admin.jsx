import React from 'react';
import Navbar from '../components/Navbar';

export default function AdminPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-light p-8">
        <div className="container mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-dark">Admin Panel</h1>
          <div className="card">
            <p>Admin features coming soon...</p>
          </div>
        </div>
      </div>
    </>
  );
}
