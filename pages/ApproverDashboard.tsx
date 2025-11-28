import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RequestStatus, PaymentRequest, RequestFile } from '../types';
import { summarizeRequest } from '../services/geminiService';
import { CheckCircle, XCircle, Sparkles, Loader2, DollarSign, FileText, Download, X, Eye } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const ApproverDashboard = () => {
  const { requests, updateRequestStatus } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [geminiSummary, setGeminiSummary] = useState<string>('');
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [action, setAction] = useState<'APPROVE' | 'REJECT' | null>(null);
  const [previewFile, setPreviewFile] = useState<RequestFile | null>(null);

  // ED only sees Authorized requests
  const pendingApprovals = requests.filter(r => r.status === RequestStatus.AUTHORIZED);
  const processedRequests = requests.filter(r => r.status === RequestStatus.APPROVED || r.status === RequestStatus.REJECTED_BY_APPROVER);

  // Statistics Calculation
  const totalAmountApproved = requests.filter(r => r.status === RequestStatus.APPROVED).reduce((acc, r) => acc + r.amount, 0);
  const totalPendingAmount = pendingApprovals.reduce((acc, r) => acc + r.amount, 0);
  
  // Data for Charts
  const deptDataMap: Record<string, number> = {};
  requests.forEach(r => {
    if (r.status === RequestStatus.APPROVED) {
        deptDataMap[r.department] = (deptDataMap[r.department] || 0) + r.amount;
    }
  });
  const deptData = Object.keys(deptDataMap).map(key => ({ name: key, value: deptDataMap[key] }));
  
  const statusDataMap: Record<string, number> = {};
  requests.forEach(r => {
      let key = r.status.toString();
      if(key.includes('Rejected')) key = 'Rejected';
      statusDataMap[key] = (statusDataMap[key] || 0) + 1;
  });
  const statusData = Object.keys(statusDataMap).map(key => ({ name: key, count: statusDataMap[key] }));

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    if (selectedRequest && selectedRequest.status === RequestStatus.AUTHORIZED) {
      setGeminiSummary(''); // Reset
      setIsSummarizing(true);
      
      summarizeRequest(selectedRequest)
        .then(summary => {
          setGeminiSummary(summary);
        })
        .finally(() => {
          setIsSummarizing(false);
        });
    } else {
        setGeminiSummary(''); // Clear summary for non-actionable requests
        setIsSummarizing(false);
    }
  }, [selectedRequest]);

  const handleFinish = () => {
    if(!selectedRequest || !action) return;
    
    const status = action === 'APPROVE' ? RequestStatus.APPROVED : RequestStatus.REJECTED_BY_APPROVER;
    updateRequestStatus(selectedRequest.id, status, remarks);
    
    setSelectedRequest(null);
    setAction(null);
    setRemarks('');
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

  return (
    <div className="space-y-8">
      <div>
           <h2 className="text-2xl font-bold text-gray-900">Executive Dashboard</h2>
           <p className="text-gray-500 text-sm">Overview, Statistics, and Approvals</p>
      </div>

      {/* Statistics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Approval</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">GHS {totalPendingAmount.toLocaleString()}</p>
            <p className="text-sm text-gray-400 mt-1">{pendingApprovals.length} requests waiting</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Approved (All Time)</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">GHS {totalAmountApproved.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex items-center justify-center">
             <div className="w-full h-24">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={statusData}>
                        <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                        <Tooltip />
                    </BarChart>
                 </ResponsiveContainer>
             </div>
        </div>
      </div>

      {/* Main Workspace Area */}
      <h3 className="text-lg font-bold text-gray-800 pt-4">Approval Workspace</h3>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* List */}
        <div className="lg:col-span-4 bg-white rounded-lg shadow overflow-hidden h-[600px] flex flex-col">
             <div className="p-4 bg-gray-50 border-b border-gray-200">
                <h3 className="font-semibold text-gray-700">Pending Queue</h3>
             </div>
             <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
                {pendingApprovals.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No pending approvals.</div>
                ) : (
                    pendingApprovals.map(req => (
                        <div 
                            key={req.id} 
                            onClick={() => setSelectedRequest(req)}
                            className={`p-4 cursor-pointer hover:bg-blue-50 transition-colors border-l-4 ${selectedRequest?.id === req.id ? 'bg-blue-50 border-blue-500' : 'border-transparent'}`}
                        >
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-gray-900">{req.vendorName}</h4>
                                <span className="font-semibold text-blue-600 text-sm">{req.currency} {req.amount.toLocaleString()}</span>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{req.requesterName}</p>
                            <p className="text-xs text-gray-400 mt-1">{new Date(req.createdAt).toLocaleDateString()}</p>
                        </div>
                    ))
                )}
             </div>
        </div>

        {/* Workspace */}
        <div className="lg:col-span-8 bg-white rounded-lg shadow p-6 min-h-[600px]">
            {!selectedRequest ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <Sparkles size={64} className="mb-4 text-gray-200" />
                    <p className="text-lg">Select a request from the queue or history to view details.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Gemini Section - Only show for actionable requests */}
                    {selectedRequest.status === RequestStatus.AUTHORIZED && (
                        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-100 shadow-sm relative overflow-hidden">
                            <div className="flex items-center space-x-2 text-indigo-700 font-semibold mb-3">
                                <Sparkles size={18} />
                                <span>AI Summary (Gemini)</span>
                            </div>
                            {isSummarizing ? (
                                <div className="flex items-center space-x-2 text-indigo-400 py-2">
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Generating executive summary...</span>
                                </div>
                            ) : (
                                <p className="text-indigo-900 leading-relaxed font-medium">
                                    {geminiSummary}
                                </p>
                            )}
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Sparkles size={100} />
                            </div>
                        </div>
                    )}
                    
                    {/* Header for non-actionable requests */}
                    {selectedRequest.status !== RequestStatus.AUTHORIZED && (
                        <div className="flex items-center justify-between border-b pb-4">
                            <h3 className="text-2xl font-bold text-gray-900">{selectedRequest.vendorName}</h3>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${selectedRequest.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {selectedRequest.status}
                            </span>
                        </div>
                    )}

                    {/* Detailed Info */}
                    <div className="grid grid-cols-2 gap-6 text-sm">
                         <div className="space-y-1">
                             <span className="text-gray-500">Authorized By</span>
                             <div className="font-medium flex items-center">
                                 <CheckCircle size={14} className="text-green-500 mr-1"/>
                                 Admin / Authorizer (ID: {selectedRequest.authorizerId})
                             </div>
                         </div>
                         <div className="space-y-1">
                             <span className="text-gray-500">Department</span>
                             <div className="font-medium">{selectedRequest.department}</div>
                         </div>
                         <div className="space-y-1 col-span-2">
                             <span className="text-gray-500">Original Description</span>
                             <div className="p-3 bg-gray-50 rounded border text-gray-600">{selectedRequest.description}</div>
                         </div>
                         <div className="space-y-1 col-span-2">
                            <span className="text-gray-500 block text-sm mb-2">Attachments</span>
                            <div className="flex flex-wrap gap-2">
                                {selectedRequest.files.map((f, i) => (
                                    <button 
                                      key={i} 
                                      onClick={() => setPreviewFile(f)}
                                      className="flex items-center space-x-2 text-xs bg-indigo-50 text-indigo-700 px-3 py-2 rounded-md border border-indigo-100 hover:bg-indigo-100 transition-colors"
                                    >
                                        <FileText size={14}/>
                                        <span className="font-medium">{f.name}</span>
                                    </button>
                                ))}
                                {selectedRequest.files.length === 0 && <span className="text-xs text-gray-400">No attachments</span>}
                            </div>
                        </div>
                         <div className="space-y-1 col-span-2">
                             <span className="text-gray-500">Payment Details</span>
                             <div className="font-mono bg-gray-50 p-2 rounded border">{selectedRequest.paymentDetails}</div>
                         </div>
                         {selectedRequest.remarks && (
                            <div className="space-y-1 col-span-2 bg-gray-50 p-3 rounded">
                                <span className="text-gray-500 font-bold text-xs uppercase">Remarks</span>
                                <div className="text-gray-700">{selectedRequest.remarks}</div>
                            </div>
                        )}
                    </div>

                    {/* Actions - Only for Authorized requests */}
                    <div className="border-t pt-6 mt-4">
                        {selectedRequest.status === RequestStatus.AUTHORIZED ? (
                            !action ? (
                                <div className="flex justify-end space-x-4">
                                    <button onClick={() => setAction('REJECT')} className="px-6 py-2.5 border border-red-200 text-red-700 rounded-lg hover:bg-red-50 font-medium transition-colors flex items-center">
                                        <XCircle size={18} className="mr-2"/> Reject
                                    </button>
                                    <button onClick={() => setAction('APPROVE')} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md transition-colors flex items-center">
                                        <CheckCircle size={18} className="mr-2"/> Approve Request
                                    </button>
                                </div>
                            ) : (
                                <div className="animate-in fade-in zoom-in-95 bg-gray-50 p-4 rounded-lg">
                                    <h4 className={`font-bold mb-2 ${action === 'APPROVE' ? 'text-blue-800' : 'text-red-800'}`}>
                                        {action === 'APPROVE' ? 'Confirm Approval' : 'Rejection Remarks'}
                                    </h4>
                                    
                                    {action === 'REJECT' && (
                                        <textarea 
                                            className="w-full border border-gray-300 rounded p-2 mb-3 focus:ring-2 focus:ring-red-500"
                                            placeholder="Reason for rejection..."
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                            rows={2}
                                        />
                                    )}
                                    
                                    {action === 'APPROVE' && <p className="mb-4 text-sm text-gray-600">This will finalize the payment request. Notifications will be sent to the Staff and Authorizer.</p>}

                                    <div className="flex justify-end space-x-3">
                                        <button onClick={() => { setAction(null); setRemarks(''); }} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900">Cancel</button>
                                        <button onClick={handleFinish} className={`px-6 py-2 rounded-lg text-white font-medium ${action === 'APPROVE' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}>
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                             <div className="text-center text-gray-500 text-sm">
                                This request is {selectedRequest.status.toLowerCase()}.
                             </div>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Approval History</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {processedRequests.length === 0 ? (
                     <tr>
                        <td colSpan={7} className="px-6 py-8 text-center text-gray-400">No history available yet.</td>
                    </tr>
                ) : (
                    processedRequests.map(req => (
                        <tr key={req.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.updatedAt).toLocaleDateString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.requesterName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.vendorName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.currency} {req.amount.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${req.status === RequestStatus.APPROVED ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                    {req.status === RequestStatus.APPROVED ? 'Approved' : 'Rejected'}
                                </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic max-w-xs truncate">
                                {req.remarks || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <button 
                                    onClick={() => setSelectedRequest(req)}
                                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
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

       {/* File Preview Modal */}
       {previewFile && (
        <div className="fixed inset-0 z-[60] overflow-hidden bg-black bg-opacity-75 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center p-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded">
                  <FileText size={20} className="text-blue-600"/>
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
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors shadow-sm"
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