
import { Role, User, PaymentRequest, RequestStatus, ChatMessage } from "../types";

export const MOCK_USERS: User[] = [
  { id: 'u1', name: 'Alice Staff', email: 'alice@org.com', password: 'password123', roles: [Role.STAFF], department: 'Marketing', position: 'Coordinator' },
  { id: 'u2', name: 'Bob Staff', email: 'bob@org.com', password: 'password123', roles: [Role.STAFF], department: 'IT', position: 'Developer' },
  { id: 'u3', name: 'Charlie Auth', email: 'charlie@org.com', password: 'password123', roles: [Role.AUTHORIZER, Role.STAFF], department: 'Marketing', position: 'Manager' },
  { id: 'u4', name: 'David Auth', email: 'david@org.com', password: 'password123', roles: [Role.AUTHORIZER], department: 'IT', position: 'Director' },
  { id: 'u5', name: 'Eve Exec', email: 'eve@org.com', password: 'password123', roles: [Role.APPROVER, Role.AUTHORIZER], department: 'Executive', position: 'Executive Director' },
  { id: 'u6', name: 'Frank Admin', email: 'admin@org.com', password: 'password123', roles: [Role.ADMIN], department: 'Admin' },
];

export const MOCK_REQUESTS: PaymentRequest[] = [
  {
    id: 'r1',
    requesterId: 'u1',
    requesterName: 'Alice Staff',
    department: 'Marketing',
    position: 'Coordinator',
    vendorName: 'Print Masters Ltd',
    paymentDetails: 'Bank: Citi, Acc: 123456',
    amount: 1250.00,
    currency: 'GHS',
    billingProject: 'YOTA Main',
    requestSubject: 'Q3 Marketing Material Printing',
    description: 'Printing of Q3 marketing brochures and flyers for the upcoming trade show.',
    billingItems: [
        { description: 'Tri-fold Brochures', unitCost: 500, quantity: 1, frequency: 1 },
        { description: 'Flyers (A5)', unitCost: 750, quantity: 1, frequency: 1 }
    ],
    withholdingTaxPercentage: 0,
    files: [{ name: 'invoice_101.pdf', type: 'invoice', url: '#' }, { name: 'approval_memo.docx', type: 'memo', url: '#' }],
    authorizerId: 'u3',
    status: RequestStatus.PENDING_AUTHORIZATION,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    signOff: 'Alice Staff',
    editCount: 0
  },
  {
    id: 'r2',
    requesterId: 'u2',
    requesterName: 'Bob Staff',
    department: 'IT',
    position: 'Developer',
    vendorName: 'Cloud Services Inc',
    paymentDetails: 'PayPal: pay@cloud.com',
    amount: 450.00,
    currency: 'USD',
    billingProject: 'Skills Hub',
    requestSubject: 'Monthly Server Hosting',
    description: 'Monthly server hosting fee for the main website.',
    billingItems: [
        { description: 'Dedicated Server Rental', unitCost: 450, quantity: 1, frequency: 1 }
    ],
    withholdingTaxPercentage: 0,
    files: [{ name: 'inv_jan.pdf', type: 'invoice', url: '#' }],
    authorizerId: 'u4',
    status: RequestStatus.AUTHORIZED,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 43200000).toISOString(),
    signOff: 'Bob Staff',
    editCount: 0
  },
  {
    id: 'r3',
    requesterId: 'u1',
    requesterName: 'Alice Staff',
    department: 'Marketing',
    position: 'Coordinator',
    vendorName: 'Event Decor Co',
    paymentDetails: 'Wire Transfer',
    amount: 3000.00,
    currency: 'GHS',
    billingProject: 'Youth Excel',
    requestSubject: 'Gala Dinner Decoration',
    description: 'Decoration services for the annual gala dinner.',
    billingItems: [],
    withholdingTaxPercentage: 0,
    files: [],
    authorizerId: 'u3',
    status: RequestStatus.APPROVED,
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 8).toISOString(),
    signOff: 'Alice Staff',
    editCount: 0
  }
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: 'm1',
    senderId: 'u3', // Charlie
    receiverId: 'u1', // Alice
    content: 'Hi Alice, regarding your print request, is the amount final?',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    isRead: true
  },
  {
    id: 'm2',
    senderId: 'u1', // Alice
    receiverId: 'u3', // Charlie
    content: 'Yes, I got the final quote yesterday.',
    timestamp: new Date(Date.now() - 86300000).toISOString(),
    isRead: true
  },
  {
    id: 'm3',
    senderId: 'u3', // Charlie
    receiverId: 'u1', // Alice
    content: 'Okay, I will review it shortly.',
    timestamp: new Date(Date.now() - 86200000).toISOString(),
    isRead: false
  }
];
