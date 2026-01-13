import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../store/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector(state => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <nav className="bg-dark text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/dashboard" className="text-2xl font-bold text-primary">
            n8n Clone
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link to="/dashboard" className="hover:text-primary transition">
              Dashboard
            </Link>
            <Link to="/workflows" className="hover:text-primary transition">
              Workflows
            </Link>
            <Link to="/executions" className="hover:text-primary transition">
              Executions
            </Link>
            
            {user && (
              <div className="flex items-center space-x-4">
                <span className="text-sm">
                  {user.firstName} {user.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline text-white border-white hover:bg-white hover:text-dark"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
