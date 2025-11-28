import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, PaymentRequest, RequestStatus, Role, AuthContextType } from '../types';
import { MOCK_USERS, MOCK_REQUESTS } from './MockData';

const AppContext = createContext<AuthContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [requests, setRequests] = useState<PaymentRequest[]>(MOCK_REQUESTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  
  // Simulate persistent login for demo smoothness
  useEffect(() => {
    const storedUserId = localStorage.getItem('payflow_user_id');
    if (storedUserId) {
      const found = users.find(u => u.id === storedUserId);
      if (found) {
        setUser(found);
        // Default to first role if not set
        if (!activeRole && found.roles.length > 0) {
            setActiveRole(found.roles[0]);
        }
      }
    }
  }, [users]);

  const login = (email: string, password: string): boolean => {
    const foundUser = users.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password
    );
    if (foundUser) {
      setUser(foundUser);
      // Set initial active role to the first one assigned
      setActiveRole(foundUser.roles.length > 0 ? foundUser.roles[0] : Role.STAFF);
      localStorage.setItem('payflow_user_id', foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setActiveRole(null);
    localStorage.removeItem('payflow_user_id');
  };

  const switchRole = (role: Role) => {
    if (user && user.roles.includes(role)) {
      setActiveRole(role);
    }
  };

  const addRequest = (reqData: any) => {
    const newRequest: PaymentRequest = {
      id: `r${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: RequestStatus.PENDING_AUTHORIZATION,
      ...reqData
    };
    setRequests(prev => [newRequest, ...prev]);
  };

  const updateRequestStatus = (id: string, status: RequestStatus, remarks?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status,
          remarks: remarks || req.remarks,
          updatedAt: new Date().toISOString()
        };
      }
      return req;
    }));
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `u${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
  };

  const editUser = (id: string, userData: Partial<User>) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        return { ...u, ...userData };
      }
      return u;
    }));
  };

  return (
    <AppContext.Provider value={{ user, activeRole, users, requests, login, logout, switchRole, addRequest, updateRequestStatus, addUser, editUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
