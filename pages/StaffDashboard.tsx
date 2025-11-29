
import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { RequestStatus, Role, RequestFile, PaymentRequest } from '../types';
import { PlusCircle, Upload, CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText, Download, X, Edit3, CreditCard, Smartphone, Landmark } from 'lucide-react';

export const StaffDashboard = () => {
  const { user, requests, users, addRequest, editRequest } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  
  // View Details State
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [previewFile, setPreviewFile] = useState<RequestFile | null>(null);

  // Form State
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'GHS' | 'USD' | 'EUR' | 'GBP'>('GHS');
  const [description, setDescription] = useState('');
  const [selectedAuthorizer, setSelectedAuthorizer] = useState('');
  const [signOff, setSignOff] = useState('');
  const [files, setFiles] = useState<{name: string, type: 'memo'|'invoice'|'other'}[]>([]);

  // Payment Details State
  const [paymentMethod, setPaymentMethod] = useState<'Mobile Money' | 'Bank Account'>('Mobile Money');
  // Momo Fields
  const [momoOperator, setMomoOperator] = useState('MTN Momo');
  const [momoNumber, setMomoNumber] = useState('');
  // Bank Fields
  const [bankName, setBankName] = useState('');
  const [accName, setAccName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [branchName, setBranchName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [swift, setSwift] = useState('');

  // Refs for file inputs
  const memoInputRef = useRef<HTMLInputElement>(null);
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  // Filter users who have the AUTHORIZER role
  const authorizers = users.filter(u => u.roles.includes(Role.AUTHORIZER));
  const myRequests = requests.filter(r => r.requesterId === user?.id);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'memo' | 'invoice') => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setFiles(prev => [...prev, { name: fileName, type }]);
    }
  };

  const handleOpenNewRequest = () => {
      setEditingRequestId(null);
      resetForm();
      setIsFormOpen(true);
  };

  const handleOpenEditRequest = (req: PaymentRequest) => {
      setEditingRequestId(req.id);
      setVendor(req.vendorName);
      setAmount(req.amount.toString());
      setCurrency(req.currency);
      setDescription(req.description);
      setSelectedAuthorizer(req.authorizerId);
      setSignOff(req.signOff);
      setFiles(req.files.map(f => ({ name: f.name, type: f.type })));

      // Attempt to parse payment details
      const details = req.paymentDetails || '';
      if (details.startsWith('Mobile Money')) {
          setPaymentMethod('Mobile Money');
          // Format: Mobile Money - OPERATOR: NUMBER
          const parts = details.split(':');
          if (parts.length >= 2) {
              const opPart = parts[0].split('-')[1]?.trim();
              if (opPart) setMomoOperator(opPart);
              setMomoNumber(parts[1]?.trim() || '');
          }
      } else if (details.startsWith('Bank Transfer')) {
          setPaymentMethod('Bank Account');
          // Simple parsing strategy or just dump into Bank Name if complex
          // Format: Bank Transfer - Bank: X, Name: Y, No: Z, Branch: A, Code: B, SWIFT: C
          const bankMatch = details.match(/Bank:\s*([^,]+)/);
          const nameMatch = details.match(/Name:\s*([^,]+)/);
          const noMatch = details.match(/No:\s*([^,]+)/);
          const branchMatch = details.match(/Branch:\s*([^,]+)/);
          const codeMatch = details.match(/Code:\s*([^,]+)/);
          const swiftMatch = details.match(/SWIFT:\s*([^$]+)/);

          if (bankMatch) setBankName(bankMatch[1].trim());
          if (nameMatch) setAccName(nameMatch[1].trim());
          if (noMatch) setAccNumber(noMatch[1].trim());
          if (branchMatch) setBranchName(branchMatch[1].trim());
          if (codeMatch) setSortCode(codeMatch[1].trim());
          if (swiftMatch) setSwift(swiftMatch[1].trim());
      } else {
          // Fallback for legacy data
          setPaymentMethod('Bank Account');
          setBankName(details); // Put everything in bank name so user sees it
      }

      setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (signOff.toLowerCase() !== user.name.toLowerCase()) {
      alert("Sign off must match your full name exactly.");
      return;
    }

    // Construct Payment Details String
    let finalPaymentDetails = '';
    if (paymentMethod === 'Mobile Money') {
        finalPaymentDetails = `Mobile Money - ${momoOperator}: ${momoNumber}`;
    } else {
        finalPaymentDetails = `Bank Transfer - Bank: ${bankName}, Name: ${accName}, No: ${accNumber}, Branch: ${branchName}, Code: ${sortCode}, SWIFT: ${swift}`;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      if (editingRequestId) {
        // Edit Mode
        editRequest(editingRequestId, {
            vendorName: vendor,
            amount: parseFloat(amount),
            currency,
            description,
            paymentDetails: finalPaymentDetails,
            authorizerId: selectedAuthorizer,
            signOff,
            files: files.map(f => ({ ...f, url: '#' })) 
        });
      } else {
        // Create Mode
        addRequest({
            requesterId: user.id,
            requesterName: user.name,
            department: user.department,
            position: user.position || 'Staff',
            vendorName: vendor,
            paymentDetails: finalPaymentDetails,
            amount: parseFloat(amount),
            currency,
            description,
            files: files.map(f => ({ ...f, url: '#' })),
            authorizerId: selectedAuthorizer,
            signOff
        });
      }

      setLoading(false);
      setIsFormOpen(false);
      resetForm();
    }, 1000);
  };

  const resetForm = () => {
    setVendor('');
    setAmount('');
    setCurrency('GHS');
    setDescription('');
    setSelectedAuthorizer('');
    setSignOff('');
    setFiles([]);
    setEditingRequestId(null);
    
    // Reset Payment fields
    setPaymentMethod('Mobile Money');
    setMomoOperator('MTN Momo');
    setMomoNumber('');
    setBankName('');
    setAccName('');
    setAccNumber('');
    setBranchName('');
    setSortCode('');
    setSwift('');
  };

  const handleDownload = (file: RequestFile) => {
    const content = `Mock content for file: ${file.name}\nType: ${file.type}\n\nThis is a generated file for demonstration purposes.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case RequestStatus.APPROVED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-teal/10 text-brand-teal"><CheckCircle size={12} className="mr-1"/> Approved</span>;
      case RequestStatus.AUTHORIZED:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-dark/10 text-brand-dark"><CheckCircle size={12} className="mr-1"/> Authorized</span>;
      case RequestStatus.PENDING_AUTHORIZATION:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock size={12} className="mr-1"/> Pending</span>;
      case RequestStatus.FROZEN:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-orange/10 text-brand-orange"><AlertCircle size={12} className="mr-1"/> Frozen</span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><XCircle size={12} className="mr-1"/> Rejected</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-2xl font-bold text-gray-900">My Requests</h2>
           <p className="text-gray-500 text-sm">Manage and track your payment requests</p>
        </div>
        <button
          onClick={handleOpenNewRequest}
          className="flex items-center space-x-2 bg-brand-teal hover:bg-[#008f7a] text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
        >
          <PlusCircle size={18} />
          <span>New Request</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <p className="text-gray-500 text-sm">Total Submitted</p>
            <p className="text-2xl font-bold text-gray-900">{myRequests.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <p className="text-gray-500 text-sm">Approved</p>
            <p className="text-2xl font-bold text-brand-teal">{myRequests.filter(r => r.status === RequestStatus.APPROVED).length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-gray-100">
            <p className="text-gray-500 text-sm">Pending</p>
            <p className="text-2xl font-bold text-yellow-600">{myRequests.filter(r => r.status === RequestStatus.PENDING_AUTHORIZATION).length}</p>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {myRequests.length === 0 ? (
                <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No requests found. Create one to get started.</td>
                </tr>
              ) : (
                myRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.vendorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.currency} {req.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(req.status)}
                        {req.editCount > 0 && (
                            <span className="ml-2 text-[10px] text-gray-400 bg-gray-100 px-1 rounded">Edits: {req.editCount}/2</span>
                        )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 flex items-center space-x-3">
                        <button 
                            onClick={() => setSelectedRequest(req)}
                            className="text-brand-dark hover:text-brand-teal flex items-center space-x-1"
                            title="View Details"
                        >
                            <Eye size={16} />
                            <span>View</span>
                        </button>
                        
                        {req.status !== RequestStatus.APPROVED && req.editCount < 2 && (
                            <button 
                                onClick={() => handleOpenEditRequest(req)}
                                className="text-gray-500 hover:text-brand-orange flex items-center space-x-1"
                                title="Edit Request"
                            >
                                <Edit3 size={16} />
                                <span>Edit</span>
                            </button>
                        )}
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                         <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                         <p className="text-sm text-gray-500">ID: {selectedRequest.id}</p>
                    </div>
                    <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                     <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                        <div>
                            <span className="block text-sm text-gray-500">Total Amount</span>
                            <span className="text-2xl font-bold text-gray-900">{selectedRequest.currency} {selectedRequest.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="block text-sm text-gray-500 mb-1">Current Status</span>
                            {getStatusBadge(selectedRequest.status)}
                            {selectedRequest.editCount > 0 && <span className="text-xs text-gray-400 mt-1">Revised {selectedRequest.editCount} times</span>}
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Vendor</label>
                            <p className="text-gray-900 font-medium">{selectedRequest.vendorName}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date Submitted</label>
                            <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-500">Payment Details</label>
                            <p className="text-gray-900 font-mono text-sm bg-gray-50 p-2 rounded">{selectedRequest.paymentDetails}</p>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Description</label>
                        <div className="p-3 bg-gray-50 rounded border border-gray-100 text-gray-700 text-sm">
                            {selectedRequest.description}
                        </div>
                     </div>
                     
                     {selectedRequest.remarks && (
                         <div className="bg-red-50 border border-red-100 rounded-lg p-4">
                             <h4 className="text-sm font-bold text-brand-orange mb-1">Remarks / Rejection Reason</h4>
                             <p className="text-sm text-gray-700">{selectedRequest.remarks}</p>
                         </div>
                     )}

                     <div>
                        <label className="block text-sm font-medium text-gray-500 mb-2">Attachments</label>
                        <div className="flex flex-wrap gap-2">
                            {selectedRequest.files.map((f, i) => (
                                <button 
                                    key={i} 
                                    onClick={() => setPreviewFile(f)}
                                    className="flex items-center space-x-2 text-xs bg-brand-teal/5 text-brand-teal px-3 py-2 rounded-md border border-brand-teal/20 hover:bg-brand-teal/10 transition-colors"
                                >
                                    <FileText size={14}/>
                                    <span className="font-medium">{f.name}</span>
                                </button>
                            ))}
                            {selectedRequest.files.length === 0 && <span className="text-xs text-gray-400">No attachments</span>}
                        </div>
                    </div>
                </div>
                <div className="p-6 border-t bg-gray-50 text-right space-x-3">
                    {selectedRequest.status !== RequestStatus.APPROVED && selectedRequest.editCount < 2 && (
                         <button 
                            onClick={() => {
                                setSelectedRequest(null);
                                handleOpenEditRequest(selectedRequest);
                            }} 
                            className="px-4 py-2 bg-brand-teal text-white rounded hover:bg-[#008f7a]"
                         >
                            Edit Request
                         </button>
                    )}
                    <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Close</button>
                </div>
             </div>
        </div>
      )}

      {/* New/Edit Request Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">{editingRequestId ? 'Edit Request' : 'New Cash Payment Request'}</h3>
              <button onClick={() => setIsFormOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                  <input required type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                    value={vendor} onChange={e => setVendor(e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Amount</label>
                  <div className="flex mt-1">
                    <select 
                        className="block rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal sm:text-sm"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value as any)}
                    >
                        <option value="GHS">GHS</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                    <input required type="number" step="0.01" className="block w-full rounded-r-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                        value={amount} onChange={e => setAmount(e.target.value)} />
                  </div>
                </div>
              </div>

              {/* Structured Payment Details */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                    <CreditCard size={16} className="mr-2" /> Payment Details
                </h4>
                
                <div className="mb-4">
                    <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payment Method</label>
                    <div className="flex space-x-4">
                        <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded border ${paymentMethod === 'Mobile Money' ? 'bg-white border-brand-teal ring-1 ring-brand-teal' : 'border-gray-300 hover:bg-white'}`}>
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                className="text-brand-teal focus:ring-brand-teal"
                                checked={paymentMethod === 'Mobile Money'}
                                onChange={() => setPaymentMethod('Mobile Money')}
                            />
                            <div className="flex items-center">
                                <Smartphone size={16} className="mr-2 text-gray-600"/>
                                <span className="text-sm font-medium">Mobile Money</span>
                            </div>
                        </label>
                        <label className={`flex items-center space-x-2 cursor-pointer p-2 rounded border ${paymentMethod === 'Bank Account' ? 'bg-white border-brand-teal ring-1 ring-brand-teal' : 'border-gray-300 hover:bg-white'}`}>
                            <input 
                                type="radio" 
                                name="paymentMethod" 
                                className="text-brand-teal focus:ring-brand-teal"
                                checked={paymentMethod === 'Bank Account'}
                                onChange={() => setPaymentMethod('Bank Account')}
                            />
                            <div className="flex items-center">
                                <Landmark size={16} className="mr-2 text-gray-600"/>
                                <span className="text-sm font-medium">Bank Account</span>
                            </div>
                        </label>
                    </div>
                </div>

                {paymentMethod === 'Mobile Money' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Network Operator</label>
                            <select 
                                required 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal sm:text-sm"
                                value={momoOperator}
                                onChange={(e) => setMomoOperator(e.target.value)}
                            >
                                <option value="MTN Momo">MTN Momo</option>
                                <option value="Telecel Cash">Telecel Cash</option>
                                <option value="AT Cash">AT Cash</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                            <input 
                                required 
                                type="text" 
                                placeholder="024xxxxxxx"
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={momoNumber}
                                onChange={(e) => setMomoNumber(e.target.value)}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">Bank Name</label>
                            <input 
                                required 
                                type="text" 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={bankName}
                                onChange={(e) => setBankName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Name</label>
                            <input 
                                required 
                                type="text" 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={accName}
                                onChange={(e) => setAccName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Account Number</label>
                            <input 
                                required 
                                type="text" 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={accNumber}
                                onChange={(e) => setAccNumber(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                            <input 
                                required 
                                type="text" 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={branchName}
                                onChange={(e) => setBranchName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Sort/IBAN/Branch Code</label>
                            <input 
                                required 
                                type="text" 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={sortCode}
                                onChange={(e) => setSortCode(e.target.value)}
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700">SWIFT Code</label>
                            <input 
                                required 
                                type="text" 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={swift}
                                onChange={(e) => setSwift(e.target.value)}
                            />
                        </div>
                    </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description / Memo Content</label>
                <textarea required rows={4} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                  placeholder="Explain the purpose of this payment..."
                  value={description} onChange={e => setDescription(e.target.value)} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => memoInputRef.current?.click()}>
                    <input type="file" ref={memoInputRef} className="hidden" accept=".pdf,.doc,.docx" onChange={(e) => handleFileChange(e, 'memo')} />
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-600">Upload Memo (PDF/Doc)</span>
                    {files.filter(f => f.type === 'memo').length > 0 && <span className="text-xs text-brand-teal mt-1">File Selected</span>}
                 </div>
                 <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => invoiceInputRef.current?.click()}>
                    <input type="file" ref={invoiceInputRef} className="hidden" accept="image/*,.pdf" onChange={(e) => handleFileChange(e, 'invoice')} />
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-600">Upload Invoice</span>
                    {files.filter(f => f.type === 'invoice').length > 0 && <span className="text-xs text-brand-teal mt-1">File Selected</span>}
                 </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Select Authorizer</label>
                    <select required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                        value={selectedAuthorizer} onChange={e => setSelectedAuthorizer(e.target.value)}>
                        <option value="">-- Select --</option>
                        {authorizers.map(a => <option key={a.id} value={a.id}>{a.name} ({a.department})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700">Digital Sign Off</label>
                    <input required type="text" placeholder={`Type "${user?.name}" to sign`}
                        className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                        value={signOff} onChange={e => setSignOff(e.target.value)} />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-medium text-white bg-brand-teal rounded-md hover:bg-[#008f7a] disabled:opacity-50">
                    {loading ? 'Processing...' : (editingRequestId ? 'Update Request' : 'Submit Request')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* File Preview Modal */}
      {previewFile && (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-brand-teal/10 p-2 rounded">
                  <FileText size={20} className="text-brand-teal"/>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{previewFile.name}</h3>
                  <p className="text-xs text-gray-500 uppercase">{previewFile.type}</p>
                </div>
              </div>
              <button 
                onClick={() => setPreviewFile(null)} 
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 bg-gray-100 overflow-auto p-8 flex items-center justify-center">
              <div className="bg-white shadow-lg p-12 max-w-2xl w-full min-h-[500px] flex flex-col items-center text-center">
                {previewFile.type === 'invoice' ? (
                   <>
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                        <span className="text-2xl font-bold text-green-600">$</span>
                      </div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">INVOICE PREVIEW</h2>
                      <p className="text-gray-500 mb-8">This is a placeholder for the actual invoice file.</p>
                      <div className="w-full space-y-4">
                        <div className="h-4 bg-gray-100 rounded w-3/4 mx-auto"></div>
                        <div className="h-4 bg-gray-100 rounded w-1/2 mx-auto"></div>
                        <div className="h-4 bg-gray-100 rounded w-5/6 mx-auto"></div>
                      </div>
                   </>
                ) : (
                   <>
                      <FileText size={64} className="text-gray-300 mb-6" />
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">DOCUMENT PREVIEW</h2>
                      <p className="text-gray-500 mb-8">This is a placeholder for the memo document.</p>
                      <div className="w-full text-left space-y-3 text-gray-300">
                        <p className="bg-gray-100 h-3 rounded w-full"></p>
                        <p className="bg-gray-100 h-3 rounded w-full"></p>
                        <p className="bg-gray-100 h-3 rounded w-3/4"></p>
                        <br/>
                        <p className="bg-gray-100 h-3 rounded w-full"></p>
                        <p className="bg-gray-100 h-3 rounded w-5/6"></p>
                      </div>
                   </>
                )}
              </div>
            </div>

            <div className="p-4 border-t bg-gray-50 flex justify-end">
              <button 
                onClick={() => handleDownload(previewFile)}
                className="flex items-center space-x-2 bg-brand-teal hover:bg-[#008f7a] text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
              >
                <Download size={18} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
