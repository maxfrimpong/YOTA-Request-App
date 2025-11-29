
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { User as UserIcon, Mail, Briefcase, Shield, Hash, Edit2, Check, X, Camera, Lock } from 'lucide-react';

export const Profile = () => {
  const { user, editUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  
  // Form State
  const [name, setName] = useState(user?.name || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profilePicture, setProfilePicture] = useState(user?.profilePictureUrl || '');

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return <div className="p-8 text-center text-gray-500">Loading profile...</div>;

  const handleEditToggle = () => {
    if (isEditing) {
        // Cancel logic
        setName(user.name);
        setProfilePicture(user.profilePictureUrl || '');
        setPassword('');
        setConfirmPassword('');
        setIsEditing(false);
    } else {
        // Start edit logic
        setName(user.name);
        setProfilePicture(user.profilePictureUrl || '');
        setPassword('');
        setConfirmPassword('');
        setIsEditing(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                setProfilePicture(reader.result);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password && password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
    }

    const updates: any = {
        name,
        profilePictureUrl: profilePicture
    };

    if (password) {
        updates.password = password;
    }

    editUser(user.id, updates);
    setIsEditing(false);
    setPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">My Profile</h2>
           <p className="text-gray-500 text-sm">Manage your account details and settings</p>
        </div>
        <button 
           onClick={handleEditToggle}
           className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors shadow-sm text-sm font-medium ${
               isEditing 
               ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
               : 'bg-brand-teal text-white hover:bg-[#008f7a]'
           }`}
        >
            {isEditing ? <><X size={16} /> <span>Cancel</span></> : <><Edit2 size={16} /> <span>Edit Profile</span></>}
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Banner / Header */}
        <div className="bg-brand-dark p-8 flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6 relative">
             <div className="relative group">
                 <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center text-brand-dark text-3xl font-bold border-4 border-white/20 shadow-xl shrink-0 overflow-hidden">
                    {profilePicture ? (
                        <img src={profilePicture} alt={name} className="h-full w-full object-cover" />
                    ) : (
                        user.name.charAt(0)
                    )}
                 </div>
                 {isEditing && (
                     <button 
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                     >
                         <Camera size={24} />
                         <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                         />
                     </button>
                 )}
             </div>
             
             <div className="text-center md:text-left pt-2 flex-1">
                {isEditing ? (
                    <div className="max-w-xs">
                        <label className="text-xs text-brand-teal uppercase font-bold">Display Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-brand-dark/50 border border-brand-teal/50 text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        />
                    </div>
                ) : (
                    <h3 className="text-2xl font-bold text-white">{user.name}</h3>
                )}
                
                <p className="text-brand-teal font-medium mt-1">{user.position || 'Staff Member'}</p>
                <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400 text-sm mt-1">
                    <Briefcase size={14} />
                    <span>{user.department}</span>
                </div>
             </div>
        </div>
        
        {/* Edit Form or View Details */}
        <form onSubmit={handleSave} className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-6">
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Contact Information</h4>
                    
                    <div className="flex items-start space-x-4">
                        <div className="p-2 bg-blue-50 rounded-lg text-brand-dark">
                            <Mail size={20} />
                        </div>
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 mb-1">Email Address</p>
                            <p className="font-medium text-gray-900">{user.email}</p>
                            <p className="text-xs text-gray-400 mt-1">Email cannot be changed directly. Contact Admin.</p>
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
                    <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider border-b pb-2">Security & Roles</h4>

                     {isEditing ? (
                         <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                             <div className="flex items-center space-x-2 mb-3">
                                <div className="p-1.5 bg-yellow-100 rounded text-yellow-700">
                                    <Lock size={16} />
                                </div>
                                <span className="font-bold text-gray-800 text-sm">Change Password</span>
                             </div>
                             <div className="space-y-3">
                                 <input 
                                    type="password" 
                                    placeholder="New Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full text-sm border-gray-300 rounded focus:ring-brand-teal focus:border-brand-teal"
                                 />
                                 <input 
                                    type="password" 
                                    placeholder="Confirm New Password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full text-sm border-gray-300 rounded focus:ring-brand-teal focus:border-brand-teal"
                                 />
                                 <p className="text-xs text-gray-500">Leave blank if you don't want to change it.</p>
                             </div>
                         </div>
                     ) : (
                        <div className="flex items-start space-x-4">
                            <div className="p-2 bg-green-50 rounded-lg text-brand-teal">
                                <Shield size={20} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 mb-2">Assigned Roles</p>
                                <div className="flex flex-wrap gap-2">
                                    {user.roles.map(role => (
                                        <span key={role} className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize border
                                            ${role === 'ADMIN' ? 'bg-purple-50 text-purple-700 border-purple-100' : 
                                            role === 'APPROVER' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                                            role === 'AUTHORIZER' ? 'bg-brand-dark/10 text-brand-dark border-brand-dark/20' : 
                                            'bg-gray-50 text-gray-700 border-gray-100'}`}>
                                            {role.replace('_', ' ')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                     )}
                </div>
            </div>

            {isEditing && (
                <div className="mt-8 pt-6 border-t flex justify-end space-x-3">
                    <button 
                        type="button" 
                        onClick={handleEditToggle} 
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button 
                        type="submit" 
                        className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brand-teal hover:bg-[#008f7a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-teal"
                    >
                        Save Changes
                    </button>
                </div>
            )}
        </form>
      </div>
    </div>
  );
};
