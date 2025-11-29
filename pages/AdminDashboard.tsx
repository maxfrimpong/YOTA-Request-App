
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { RequestStatus, Role, User } from '../types';
import { Users, LayoutDashboard, UserPlus, X, Shield, Briefcase, Mail, Key, Edit2, Settings, Upload, Image as ImageIcon } from 'lucide-react';

const DEPARTMENTS = [
  "Finance", 
  "Projects", 
  "Operations & Logistics", 
  "Digital Engagement", 
  "IT", 
  "Skills Hub", 
  "Get Into Employment", 
  "HR & Admin"
];

const POSITIONS = [
  "Executive Director", 
  "Skills & Innovation Manager", 
  "Project Manager", 
  "Project Associate", 
  "Project Officer", 
  "Finance Manager", 
  "Finance Officer", 
  "Finance Associate", 
  "Digital Engagement Manager", 
  "Digital Engagement Analyst", 
  "Digital Engagement Associate", 
  "IT Manager",
  "IT Officer",
  "IT Associate",
  "Operations Manager", 
  "Operations Support Officer", 
  "Driver", 
  "Senior Driver", 
  "Security", 
  "Senior Housekeeper", 
  "Housekeeper", 
  "Senior Security Officer", 
  "Security Officer", 
  "Intern"
];

export const AdminDashboard = () => {
  const { requests, users, addUser, editUser, updateLogo, logoUrl } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'settings'>('overview');
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [newPosition, setNewPosition] = useState('');
  // Roles are now an array
  const [newRoles, setNewRoles] = useState<Role[]>([]);
  const [newPassword, setNewPassword] = useState('');

  // Calculate Totals
  const totalRequests = requests.length;
  const totalAmount = requests.reduce((acc, r) => acc + r.amount, 0);
  const pendingCount = requests.filter(r => r.status === RequestStatus.PENDING_AUTHORIZATION).length;
  const approvedCount = requests.filter(r => r.status === RequestStatus.APPROVED).length;

  // Data for Department Pie Chart
  const deptDataMap: Record<string, number> = {};
  requests.forEach(r => {
    deptDataMap[r.department] = (deptDataMap[r.department] || 0) + 1;
  });
  const deptData = Object.keys(deptDataMap).map(key => ({ name: key, value: deptDataMap[key] }));

  // Data for Status Bar Chart
  const statusDataMap: Record<string, number> = {};
  requests.forEach(r => {
    let key = r.status.toString();
    if(key.includes('Rejected')) key = 'Rejected';
    statusDataMap[key] = (statusDataMap[key] || 0) + 1;
  });
  const statusData = Object.keys(statusDataMap).map(key => ({ name: key, count: statusDataMap[key] }));

  const COLORS = ['#00a88f', '#006680', '#fa4515', '#ffc658', '#82ca9d'];

  const openAddUserModal = () => {
    setEditingUserId(null);
    setNewName('');
    setNewEmail('');
    setNewDepartment('');
    setNewPosition('');
    setNewRoles([Role.STAFF]); // Default
    setNewPassword('');
    setIsUserModalOpen(true);
  };

  const openEditUserModal = (user: User) => {
    setEditingUserId(user.id);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewDepartment(user.department);
    setNewPosition(user.position || '');
    setNewRoles(user.roles);
    setNewPassword(user.password || '');
    setIsUserModalOpen(true);
  };

  const toggleRole = (role: Role) => {
    setNewRoles(prev => {
        if (prev.includes(role)) {
            // Prevent removing the last role if desired, or just allow empty
            // For now, let's allow it but warn on submit if empty
            return prev.filter(r => r !== role);
        } else {
            return [...prev, role];
        }
    });
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newRoles.length === 0) {
        alert("Please select at least one role.");
        return;
    }

    if (editingUserId) {
      editUser(editingUserId, {
        name: newName,
        email: newEmail,
        department: newDepartment,
        position: newPosition,
        roles: newRoles,
        password: newPassword
      });
    } else {
      addUser({
          name: newName,
          email: newEmail,
          department: newDepartment,
          position: newPosition,
          roles: newRoles,
          password: newPassword
      });
    }
    
    // Reset and Close
    setIsUserModalOpen(false);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                updateLogo(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Tabs */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">Admin Portal</h2>
           <p className="text-gray-500 text-sm">System administration and analytics</p>
        </div>
        <div className="flex bg-gray-200 p-1 rounded-lg self-start">
            <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
                <LayoutDashboard size={16} />
                <span>Overview</span>
            </button>
            <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'users' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
                <Users size={16} />
                <span>User Management</span>
            </button>
            <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'settings' ? 'bg-white text-brand-teal shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
                <Settings size={16} />
                <span>Settings</span>
            </button>
        </div>
      </div>

      {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Volume</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">GHS {totalAmount.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Requests</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{totalRequests}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Approved</h3>
                    <p className="text-3xl font-bold text-brand-teal mt-2">{approvedCount}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending</h3>
                    <p className="text-3xl font-bold text-yellow-600 mt-2">{pendingCount}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-lg shadow min-h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Requests by Department</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={deptData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {deptData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                <div className="bg-white p-6 rounded-lg shadow min-h-[400px]">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Request Status Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={statusData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{fontSize: 12}} />
                            <YAxis allowDecimals={false} />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="count" fill="#006680" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
            
            {/* Recent Activity Table */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="font-bold text-gray-800">Recent System Activity</h3>
                </div>
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {requests.slice(0, 10).map((req) => (
                            <tr key={req.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.requesterName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.vendorName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.currency} {req.amount.toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
      )}

      {activeTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
             <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm">
                 <h3 className="text-lg font-bold text-gray-800">User Directory</h3>
                 <button 
                    onClick={openAddUserModal}
                    className="flex items-center space-x-2 bg-brand-teal hover:bg-[#008f7a] text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
                 >
                     <UserPlus size={18} />
                     <span>Add New User</span>
                 </button>
             </div>

             <div className="bg-white shadow rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-brand-teal/10 flex items-center justify-center text-brand-teal font-bold mr-3 overflow-hidden">
                                            {u.profilePictureUrl ? (
                                                <img src={u.profilePictureUrl} alt={u.name} className="w-full h-full object-cover" />
                                            ) : (
                                                u.name.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{u.name}</div>
                                            <div className="text-xs text-gray-500">{u.position || 'N/A'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex flex-wrap gap-1">
                                        {u.roles.map(r => (
                                            <span key={r} className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${r === Role.ADMIN ? 'bg-purple-100 text-purple-800' : 
                                                r === Role.APPROVER ? 'bg-indigo-100 text-indigo-800' :
                                                r === Role.AUTHORIZER ? 'bg-brand-dark/10 text-brand-dark' : 
                                                'bg-gray-100 text-gray-800'}`}>
                                                {r.replace('_', ' ')}
                                            </span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button 
                                        onClick={() => openEditUserModal(u)}
                                        className="text-brand-dark hover:text-brand-teal flex items-center justify-end w-full"
                                    >
                                        <Edit2 size={16} className="mr-1" /> Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
          </div>
      )}

      {activeTab === 'settings' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <ImageIcon size={20} className="text-brand-teal" />
                        Branding Settings
                    </h3>
                    
                    <div className="border rounded-lg p-6 bg-gray-50 flex flex-col items-center justify-center gap-6">
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-700 mb-2">Current Organization Logo</p>
                            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 inline-block">
                                <img src={logoUrl} alt="Organization Logo" className="h-24 w-auto object-contain" />
                            </div>
                        </div>

                        <div className="w-full max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-2 text-center">Upload New Logo (PNG, JPG, SVG)</label>
                            <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-100 transition-colors">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    onChange={handleLogoUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                <Upload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                                <p className="text-sm text-gray-500">Click or drag file to upload</p>
                            </div>
                        </div>
                    </div>
               </div>

               <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 opacity-60">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <Shield size={20} className="text-gray-500" />
                        Other System Settings
                    </h3>
                    <p className="text-sm text-gray-500">Additional system configurations are currently disabled in demo mode.</p>
               </div>
          </div>
      )}

      {/* Add/Edit User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center p-6 border-b">
                    <h3 className="text-xl font-bold text-gray-900">{editingUserId ? 'Edit User' : 'Add New User'}</h3>
                    <button onClick={() => setIsUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>
                
                <form onSubmit={handleUserSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Users size={16} className="text-gray-400" />
                            </div>
                            <input required type="text" className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. John Doe" />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Mail size={16} className="text-gray-400" />
                            </div>
                            <input required type="email" className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@organization.com" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Briefcase size={16} className="text-gray-400" />
                                </div>
                                <select 
                                    required
                                    className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal bg-white text-sm"
                                    value={newDepartment} 
                                    onChange={e => setNewDepartment(e.target.value)} 
                                >
                                    <option value="">Select Dept</option>
                                    {DEPARTMENTS.map(dept => (
                                        <option key={dept} value={dept}>{dept}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                            <select 
                                required
                                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal bg-white text-sm"
                                value={newPosition} 
                                onChange={e => setNewPosition(e.target.value)} 
                            >
                                <option value="">Select Position</option>
                                {POSITIONS.map(pos => (
                                    <option key={pos} value={pos}>{pos}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Assign Roles</label>
                        <div className="bg-gray-50 p-4 rounded-md border border-gray-200 space-y-2">
                             {[Role.STAFF, Role.AUTHORIZER, Role.APPROVER, Role.ADMIN].map((role) => (
                                 <label key={role} className="flex items-center space-x-3 cursor-pointer">
                                     <input 
                                        type="checkbox" 
                                        className="h-4 w-4 text-brand-teal focus:ring-brand-teal border-gray-300 rounded"
                                        checked={newRoles.includes(role)}
                                        onChange={() => toggleRole(role)}
                                     />
                                     <div className="flex flex-col">
                                         <span className="text-sm font-medium text-gray-900 capitalize">{role.replace('_', ' ')}</span>
                                         <span className="text-xs text-gray-500">
                                            {role === Role.STAFF && "Can submit requests"}
                                            {role === Role.AUTHORIZER && "Can authorize requests"}
                                            {role === Role.APPROVER && "Executive approval"}
                                            {role === Role.ADMIN && "System management"}
                                         </span>
                                     </div>
                                 </label>
                             ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            {editingUserId ? "Reset Password (Optional)" : "Temporary Password"}
                        </label>
                         <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Key size={16} className="text-gray-400" />
                            </div>
                            <input 
                                required={!editingUserId} 
                                type="text" 
                                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal font-mono"
                                value={newPassword} 
                                onChange={e => setNewPassword(e.target.value)} 
                                placeholder={editingUserId ? "Leave empty to keep current" : "Enter temp password"} 
                            />
                        </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t mt-2">
                        <button type="button" onClick={() => setIsUserModalOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-300 rounded-md hover:bg-gray-100">Cancel</button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-brand-teal rounded-md hover:bg-[#008f7a] shadow-sm">
                            {editingUserId ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};
