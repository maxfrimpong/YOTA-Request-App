
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RequestStatus, PaymentRequest, RequestFile } from '../types';
import { CheckCircle, XCircle, AlertTriangle, Eye, FileText, Download, X } from 'lucide-react';

export const AuthorizerDashboard = () => {
  const { user, requests, updateRequestStatus } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [action, setAction] = useState<'AUTHORIZE' | 'REJECT' | 'FREEZE' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [previewFile, setPreviewFile] = useState<RequestFile | null>(null);

  // Requests needing this user's authorization
  const pendingRequests = requests.filter(r => 
    r.authorizerId === user?.id && r.status === RequestStatus.PENDING_AUTHORIZATION
  );
  
  // History of requests handled by this authorizer
  const historyRequests = requests.filter(r => 
    r.authorizerId === user?.id && r.status !== RequestStatus.PENDING_AUTHORIZATION
  );

  const handleAction = () => {
    if (!selectedRequest || !action) return;
    
    let status: RequestStatus;
    switch(action) {
      case 'AUTHORIZE': status = RequestStatus.AUTHORIZED; break;
      case 'REJECT': status = RequestStatus.REJECTED_BY_AUTHORIZER; break;
      case 'FREEZE': status = RequestStatus.FROZEN; break;
      default: return;
    }

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
        <h2 className="text-2xl font-bold text-gray-900">Authorization Queue</h2>
        <p className="text-gray-500 text-sm">Review pending requests assigned to you</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Queue List */}
        <div className="bg-white rounded-lg shadow h-fit">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Pending Actions ({pendingRequests.length})</h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
            {pendingRequests.length === 0 ? (
                <div className="p-6 text-center text-gray-400">All caught up! No pending requests.</div>
            ) : (
                pendingRequests.map(req => (
                    <div key={req.id} className="p-4 hover:bg-gray-50 transition-colors flex justify-between items-start">
                        <div>
                            <p className="font-bold text-gray-900">{req.requestSubject}</p>
                            <p className="text-sm text-gray-600">{req.vendorName} - {req.currency} {req.amount.toLocaleString()}</p>
                            <p className="text-xs text-gray-400 mt-1">From: {req.requesterName} ({req.department})</p>
                        </div>
                        <button 
                            onClick={() => setSelectedRequest(req)}
                            className="bg-brand-dark/10 text-brand-dark px-3 py-1.5 rounded text-sm font-medium hover:bg-brand-dark/20"
                        >
                            Review
                        </button>
                    </div>
                ))
            )}
          </div>
        </div>

        {/* Detail View / Action Panel */}
        <div className="bg-white rounded-lg shadow">
           {!selectedRequest ? (
               <div className="h-64 flex flex-col items-center justify-center text-gray-400 p-6">
                   <Eye size={48} className="mb-4 opacity-20"/>
                   <p>Select a request from the queue or history to view details.</p>
               </div>
           ) : (
               <div className="p-6">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                           <h3 className="text-xl font-bold text-gray-900">{selectedRequest.requestSubject}</h3>
                           <p className="text-sm text-gray-500">{selectedRequest.vendorName}</p>
                           <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mt-1
                                ${selectedRequest.status === RequestStatus.AUTHORIZED ? 'bg-brand-dark/10 text-brand-dark' : 
                                  selectedRequest.status === RequestStatus.APPROVED ? 'bg-brand-teal/10 text-brand-teal' : 
                                  selectedRequest.status === RequestStatus.PENDING_AUTHORIZATION ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-brand-orange/10 text-brand-orange'}`}>
                                {selectedRequest.status}
                           </span>
                        </div>
                        <span className="text-2xl font-bold text-brand-dark">{selectedRequest.currency} {selectedRequest.amount.toLocaleString()}</span>
                    </div>

                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="text-gray-500 block">Requester</span>
                                <span className="font-medium">{selectedRequest.requesterName}</span>
                            </div>
                            <div>
                                <span className="text-gray-500 block">Department</span>
                                <span className="font-medium">{selectedRequest.department}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 block">Billing Project</span>
                                <span className="font-medium text-brand-teal">{selectedRequest.billingProject}</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-gray-500 block">Payment Details</span>
                                <span className="font-medium font-mono bg-gray-50 px-2 py-1 rounded block mt-1">{selectedRequest.paymentDetails}</span>
                            </div>
                        </div>

                        <div>
                            <span className="text-gray-500 block text-sm mb-1">Description</span>
                            <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg border border-gray-100">
                                {selectedRequest.description}
                            </p>
                        </div>
                        
                        {selectedRequest.remarks && (
                            <div className="bg-gray-50 border border-gray-200 rounded p-3">
                                <span className="text-gray-500 block text-xs font-bold uppercase mb-1">Remarks</span>
                                <p className="text-sm text-gray-800">{selectedRequest.remarks}</p>
                            </div>
                        )}

                        <div>
                            <span className="text-gray-500 block text-sm mb-2">Attachments</span>
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

                    <div className="border-t pt-6">
                        {selectedRequest.status === RequestStatus.PENDING_AUTHORIZATION ? (
                            !action ? (
                                <div className="flex space-x-3">
                                    <button onClick={() => setAction('AUTHORIZE')} className="flex-1 bg-brand-teal hover:bg-[#008f7a] text-white py-2 rounded-lg font-medium transition-colors flex justify-center items-center">
                                        <CheckCircle size={18} className="mr-2"/> Authorize
                                    </button>
                                    <button onClick={() => setAction('FREEZE')} className="flex-1 bg-orange-400 hover:bg-orange-500 text-white py-2 rounded-lg font-medium transition-colors flex justify-center items-center">
                                        <AlertTriangle size={18} className="mr-2"/> Freeze
                                    </button>
                                    <button onClick={() => setAction('REJECT')} className="flex-1 bg-brand-orange hover:bg-[#d63a10] text-white py-2 rounded-lg font-medium transition-colors flex justify-center items-center">
                                        <XCircle size={18} className="mr-2"/> Reject
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <h4 className="font-medium text-gray-900">
                                        {action === 'AUTHORIZE' ? 'Confirm Authorization' : 
                                        action === 'FREEZE' ? 'Reason for Freezing' : 'Reason for Rejection'}
                                    </h4>
                                    
                                    {action !== 'AUTHORIZE' && (
                                        <textarea 
                                            className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-brand-teal focus:border-brand-teal"
                                            placeholder="Add remarks for the requester..."
                                            rows={3}
                                            value={remarks}
                                            onChange={e => setRemarks(e.target.value)}
                                        />
                                    )}

                                    {action === 'AUTHORIZE' && <p className="text-sm text-gray-600">This request will be forwarded to the Executive Director for final approval.</p>}

                                    <div className="flex space-x-3">
                                        <button onClick={() => { setAction(null); setRemarks(''); }} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 rounded-lg font-medium">Cancel</button>
                                        <button onClick={handleAction} className={`flex-1 text-white py-2 rounded-lg font-medium 
                                            ${action === 'AUTHORIZE' ? 'bg-brand-teal hover:bg-[#008f7a]' : 
                                            action === 'FREEZE' ? 'bg-orange-400 hover:bg-orange-500' : 'bg-brand-orange hover:bg-[#d63a10]'}`}>
                                            Confirm
                                        </button>
                                    </div>
                                </div>
                            )
                        ) : (
                             <div className="text-center text-gray-500 text-sm bg-gray-50 py-3 rounded-lg">
                                This request has already been processed.
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
            <h3 className="font-semibold text-gray-800">History</h3>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {historyRequests.map(req => (
                    <tr key={req.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.updatedAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.requesterName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.requestSubject}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.currency} {req.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                ${req.status === RequestStatus.AUTHORIZED ? 'bg-brand-dark/10 text-brand-dark' : 
                                  req.status === RequestStatus.APPROVED ? 'bg-brand-teal/10 text-brand-teal' : 
                                  'bg-brand-orange/10 text-brand-orange'}`}>
                                {req.status}
                            </span>
                        </td>
                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 italic max-w-xs truncate">
                           {req.remarks || '-'}
                         </td>
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
                ))}
            </tbody>
        </table>
      </div>

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
