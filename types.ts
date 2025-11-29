
export enum Role {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  AUTHORIZER = 'AUTHORIZER',
  APPROVER = 'APPROVER' // Executive Director
}

export enum RequestStatus {
  PENDING_AUTHORIZATION = 'Pending Authorization',
  AUTHORIZED = 'Authorized',
  FROZEN = 'Frozen',
  REJECTED_BY_AUTHORIZER = 'Rejected (Auth)',
  APPROVED = 'Approved',
  REJECTED_BY_APPROVER = 'Rejected (ED)'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  roles: Role[]; // Changed from single role to array
  department: string;
  position?: string;
  profilePictureUrl?: string;
}

export interface RequestFile {
  name: string;
  type: 'memo' | 'invoice' | 'other';
  url: string; // Mock URL
}

export interface PaymentRequest {
  id: string;
  requesterId: string;
  requesterName: string;
  department: string;
  position: string;
  vendorName: string;
  paymentDetails: string;
  amount: number;
  currency: string; // Changed from enum to string to support dynamic lists
  billingProject: string; // New field
  requestSubject: string; // New field
  description: string;
  files: RequestFile[];
  authorizerId: string;
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  remarks?: string; // For rejection/freezing notes
  signOff: string; // Requester's name signature
  editCount: number; // Track number of edits
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  type: 'info' | 'success' | 'error' | 'warning';
}

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: string;
  isRead: boolean;
}

export interface SystemLists {
  currencies: string[];
  billingProjects: string[];
  paymentMethods: string[];
  momoOperators: string[];
}

export interface AuthContextType {
  user: User | null;
  activeRole: Role | null; // The currently selected role for the session
  users: User[];
  requests: PaymentRequest[];
  notifications: Notification[];
  messages: ChatMessage[];
  logoUrl: string;
  onlineUserIds: string[];
  systemLists: SystemLists;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchRole: (role: Role) => void;
  addRequest: (req: Omit<PaymentRequest, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'editCount'>) => void;
  editRequest: (id: string, updatedData: Partial<PaymentRequest>) => void;
  updateRequestStatus: (id: string, status: RequestStatus, remarks?: string) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  editUser: (id: string, userData: Partial<User>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  sendMessage: (receiverId: string, content: string) => void;
  markChatAsRead: (senderId: string) => void;
  updateLogo: (url: string) => void;
  updateSystemList: (listName: keyof SystemLists, newList: string[]) => void;
}
