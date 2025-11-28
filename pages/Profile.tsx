import React from 'react';
import { useApp } from '../context/AppContext';
import { User as UserIcon, Mail, Briefcase, Shield, Hash } from 'lucide-react';

export const Profile = () => {
  const { user } = useApp();

  if (!user) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
        <p className="text-gray-500 text-sm">View your account details</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner / Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
             <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-slate-900 text-3xl font-bold border-4 border-white/20 shadow-xl shrink-0">
                {user.name.charAt(0)}
             </div>
             <div className="text-center md:text-left pt-2">
                <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                <p className="text-blue-200 font-medium">{user.position || 'Staff Member'}</p>
                <div className="flex items-center justify-center md:justify-start space-x-2 text-slate-400 text-sm mt-1">
                    <Briefcase size={14} />
                    <span>{user.department}</span>
                </div>
             </div>
        </div>
        
        {/* Details Grid */}
        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Contact Information</h4>
                
                <div className="flex items-start space-x-4">
                    <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                        <Mail size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">Email Address</p>
                        <p className="font-medium text-gray-900">{user.email}</p>
                    </div>
                </div>

                <div className="flex items-start space-x-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                        <Hash size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-1">System User ID</p>
                        <p className="font-medium text-gray-900 font-mono text-sm">{user.id}</p>
                    </div>
                </div>
            </div>

            <div className="space-y-6">
                <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Access & Roles</h4>

                <div className="flex items-start space-x-4">
                    <div className="p-2 bg-green-50 rounded-lg text-green-600">
                         <Shield size={20} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-500 mb-2">Assigned Roles</p>
                        <div className="flex flex-wrap gap-2">
                            {user.roles.map(role => (
                                <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                                    ${role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                      role === 'APPROVER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                      role === 'AUTHORIZER' ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                                      'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                    {role.replace('_', ' ')}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
                
                <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                     <p className="text-xs text-yellow-800">
                        To update your profile details or change your password, please contact the System Administrator.
                     </p>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};