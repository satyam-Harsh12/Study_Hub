import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);

const ROLE_DASHBOARD_MAP = {
  super_admin: '/dashboard/admin',
  admin: '/dashboard/admin',
  course_admin: '/dashboard/admin',
  finance_admin: '/dashboard/admin',
  hr_admin: '/dashboard/admin',
  instructor: '/dashboard/instructor',
  student: '/dashboard/student'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('tms_token');
    const storedUser = localStorage.getItem('tms_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (userData, jwtToken) => {
    setUser(userData);
    setToken(jwtToken);
    localStorage.setItem('tms_token', jwtToken);
    localStorage.setItem('tms_user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('tms_token');
    localStorage.removeItem('tms_user');
  };

  const getDefaultDashboard = (paramUser) => {
    const targetUser = paramUser || user;
    if (!targetUser?.role) return '/';
    return ROLE_DASHBOARD_MAP[targetUser.role] || '/';
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user && !!token,
        loading,
        login,
        logout,
        getDefaultDashboard
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);


