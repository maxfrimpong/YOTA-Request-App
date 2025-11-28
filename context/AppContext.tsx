import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, PaymentRequest, RequestStatus, Role, AuthContextType, Notification, ChatMessage } from '../types';
import { MOCK_USERS, MOCK_REQUESTS, MOCK_MESSAGES } from './MockData';

const AppContext = createContext<AuthContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeRole, setActiveRole] = useState<Role | null>(null);
  const [requests, setRequests] = useState<PaymentRequest[]>(MOCK_REQUESTS);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>(MOCK_MESSAGES);
  
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

  const createNotification = (userId: string, message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    const newNote: Notification = {
      id: `n${Date.now()}-${Math.random()}`,
      userId,
      message,
      type,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNote, ...prev]);
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

    // Notify Authorizer
    if (reqData.authorizerId) {
      createNotification(
        reqData.authorizerId,
        `New payment request from ${reqData.requesterName} for ${reqData.vendorName} awaits your authorization.`,
        'info'
      );
    }
  };

  const updateRequestStatus = (id: string, status: RequestStatus, remarks?: string) => {
    // Find the request before updating to get current details
    const targetRequest = requests.find(r => r.id === id);
    
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

    if (!targetRequest) return;

    // Logic to notify relevant parties
    // 1. Notify Requester on any status change
    let requesterMsg = '';
    let requesterType: 'success' | 'error' | 'warning' | 'info' = 'info';

    switch (status) {
      case RequestStatus.AUTHORIZED:
        requesterMsg = `Your request to ${targetRequest.vendorName} has been AUTHORIZED and sent to the Executive Director.`;
        requesterType = 'success';
        break;
      case RequestStatus.APPROVED:
        requesterMsg = `Great news! Your request to ${targetRequest.vendorName} has been fully APPROVED.`;
        requesterType = 'success';
        break;
      case RequestStatus.REJECTED_BY_AUTHORIZER:
        requesterMsg = `Your request to ${targetRequest.vendorName} was REJECTED by the Authorizer.`;
        requesterType = 'error';
        break;
      case RequestStatus.REJECTED_BY_APPROVER:
        requesterMsg = `Your request to ${targetRequest.vendorName} was REJECTED by the Executive Director.`;
        requesterType = 'error';
        break;
      case RequestStatus.FROZEN:
        requesterMsg = `Your request to ${targetRequest.vendorName} has been FROZEN. Please check remarks.`;
        requesterType = 'warning';
        break;
    }

    if (requesterMsg) {
      createNotification(targetRequest.requesterId, requesterMsg, requesterType);
    }

    // 2. Notify Approver (Executive Director) when Authorized
    if (status === RequestStatus.AUTHORIZED) {
      // Find all approvers
      const approvers = users.filter(u => u.roles.includes(Role.APPROVER));
      approvers.forEach(approver => {
        createNotification(
          approver.id,
          `New Authorized request for ${targetRequest.vendorName} (${targetRequest.currency} ${targetRequest.amount}) requires your approval.`,
          'info'
        );
      });
    }

    // 3. Notify Authorizer when Approver takes action (Approved/Rejected)
    if (status === RequestStatus.APPROVED || status === RequestStatus.REJECTED_BY_APPROVER) {
      const authMsg = status === RequestStatus.APPROVED 
        ? `The request to ${targetRequest.vendorName} you authorized has been APPROVED by the Executive Director.`
        : `The request to ${targetRequest.vendorName} you authorized was REJECTED by the Executive Director.`;
      
      const authType = status === RequestStatus.APPROVED ? 'success' : 'warning';
      
      createNotification(targetRequest.authorizerId, authMsg, authType);
    }
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

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllAsRead = () => {
    if (!user) return;
    setNotifications(prev => prev.map(n => n.userId === user.id ? { ...n, isRead: true } : n));
  };

  const sendMessage = (receiverId: string, content: string) => {
    if (!user) return;
    const newMessage: ChatMessage = {
      id: `m${Date.now()}`,
      senderId: user.id,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const markChatAsRead = (senderId: string) => {
    if (!user) return;
    setMessages(prev => prev.map(msg => 
      (msg.senderId === senderId && msg.receiverId === user.id && !msg.isRead)
        ? { ...msg, isRead: true }
        : msg
    ));
  };

  return (
    <AppContext.Provider value={{ 
      user, activeRole, users, requests, notifications, messages,
      login, logout, switchRole, addRequest, updateRequestStatus, addUser, editUser,
      markAsRead, markAllAsRead, sendMessage, markChatAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};