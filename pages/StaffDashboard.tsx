import React, { useState, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { RequestStatus, Role, RequestFile, PaymentRequest } from '../types';
import { PlusCircle, Upload, CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText, Download, X } from 'lucide-react';

export const StaffDashboard = () => {
  const { user, requests, users, addRequest } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // View Details State
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [previewFile, setPreviewFile] = useState<RequestFile | null>(null);

  // Form State
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'GHS' | 'USD' | 'EUR' | 'GBP'>('GHS');
  const [description, setDescription] = useState('');
  const [paymentDetails, setPaymentDetails] = useState('');
  const [selectedAuthorizer, setSelectedAuthorizer] = useState('');
  const [signOff, setSignOff] = useState('');
  const [files, setFiles] = useState<{name: string, type: 'memo'|'invoice'}[]>([]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (signOff.toLowerCase() !== user.name.toLowerCase()) {
      alert("Sign off must match your full name exactly.");
      return;
    }

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      addRequest({
        requesterId: user.id,
        requesterName: user.name,
        department: user.department,
        position: user.position || 'Staff',
        vendorName: vendor,
        paymentDetails,
        amount: parseFloat(amount),
        currency,
        description,
        files: files.map(f => ({ ...f, url: '#' })),
        authorizerId: selectedAuthorizer,
        signOff
      });
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
    setPaymentDetails('');
    setSelectedAuthorizer('');
    setSignOff('');
    setFiles([]);
  };

  const handleDownload = (file: RequestFile) => {
    // Simulate download by creating a blob
    const content = `Mock content for file: ${file.name}\nType: ${file.type}\n\nThis is a generated file for demonstration purposes.`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name; // Use the mock filename
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
          onClick={() => setIsFormOpen(true)}
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
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(req.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button 
                            onClick={() => setSelectedRequest(req)}
                            className="text-brand-dark hover:text-brand-teal flex items-center space-x-1"
                        >
                            <Eye size={16} />
                            <span>View</span>
                        </button>
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
                <div className="p-6 border-t bg-gray-50 text-right">
                    <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">Close</button>
                </div>
             </div>
        </div>
      )}

      {/* New Request Modal */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-bold text-gray-900">New Cash Payment Request</h3>
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

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Details (Bank/Account)</label>
                <input required type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                  value={paymentDetails} onChange={e => setPaymentDetails(e.target.value)} />
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
                    {loading ? 'Submitting...' : 'Submit Request'}
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