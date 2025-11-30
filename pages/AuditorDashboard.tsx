
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { RequestStatus, PaymentRequest } from '../types';
import { Eye, XCircle, Printer } from 'lucide-react';
import { printPaymentRequest } from '../utils/pdfGenerator';

export const AuditorDashboard = () => {
  const { requests, users, logoUrl } = useApp();
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);

  // Filter only approved requests
  const approvedRequests = requests.filter(r => r.status === RequestStatus.APPROVED);

  const handlePrint = () => {
    if (!selectedRequest) return;
    printPaymentRequest(selectedRequest, users, logoUrl);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Auditor Portal</h2>
        <p className="text-gray-500 text-sm">Review and download approved payment records</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-gray-800">Approved Requests Repository</h3>
            <span className="bg-brand-teal/10 text-brand-teal text-xs px-2 py-1 rounded-full font-bold">
                {approvedRequests.length} Records
            </span>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Approved Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Vendor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {approvedRequests.length === 0 ? (
                <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400">No approved requests available yet.</td>
                </tr>
              ) : (
                approvedRequests.map((req) => (
                    <tr key={req.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(req.updatedAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{req.requestSubject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{req.vendorName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">{req.currency} {req.amount.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-brand-teal">{req.billingProject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button 
                            onClick={() => setSelectedRequest(req)}
                            className="text-brand-dark hover:text-brand-teal flex items-center justify-end w-full"
                        >
                            <Eye size={16} className="mr-1" /> View
                        </button>
                    </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
             <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b">
                    <div>
                         <h3 className="text-xl font-bold text-gray-900">Request Details</h3>
                         <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-teal/10 text-brand-teal mt-1">
                            Verified Approved
                         </span>
                    </div>
                    <button onClick={() => setSelectedRequest(null)} className="text-gray-400 hover:text-gray-600">
                        <XCircle size={24} />
                    </button>
                </div>
                
                <div className="p-6 space-y-6">
                    {/* Key Info Grid */}
                     <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="col-span-2 md:col-span-1">
                           <label className="block text-gray-500 text-xs uppercase font-bold">Subject</label>
                           <p className="text-gray-900 font-medium text-lg">{selectedRequest.requestSubject}</p>
                        </div>
                        <div className="col-span-2 md:col-span-1 text-right">
                           <label className="block text-gray-500 text-xs uppercase font-bold">Total Amount</label>
                           <p className="text-brand-teal font-bold text-2xl">{selectedRequest.currency} {selectedRequest.amount.toLocaleString()}</p>
                        </div>
                        
                        <div>
                           <label className="block text-gray-500 text-xs uppercase font-bold">Billing Project</label>
                           <p className="text-gray-900">{selectedRequest.billingProject}</p>
                        </div>
                        <div>
                           <label className="block text-gray-500 text-xs uppercase font-bold">Vendor</label>
                           <p className="text-gray-900">{selectedRequest.vendorName}</p>
                        </div>
                        <div className="col-span-2">
                           <label className="block text-gray-500 text-xs uppercase font-bold">Payment Details</label>
                           <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 font-mono text-xs">{selectedRequest.paymentDetails}</p>
                        </div>
                     </div>

                     {/* Billing Table */}
                     {selectedRequest.billingItems && (
                         <div className="border border-gray-200 rounded-lg overflow-hidden">
                             <table className="min-w-full divide-y divide-gray-200">
                                 <thead className="bg-gray-50">
                                     <tr>
                                         <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                         <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Cost</th>
                                         <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                         <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-200 bg-white">
                                     {selectedRequest.billingItems.map((item, idx) => (
                                         <tr key={idx}>
                                             <td className="px-3 py-2 text-sm">{item.description}</td>
                                             <td className="px-3 py-2 text-sm text-right">{item.unitCost.toLocaleString()}</td>
                                             <td className="px-3 py-2 text-sm text-right">{item.quantity}</td>
                                             <td className="px-3 py-2 text-sm text-right">{(item.unitCost * item.quantity * item.frequency).toLocaleString()}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                         </div>
                     )}

                     {/* Signatures / People */}
                     <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Authorization Chain</h4>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Requester</p>
                                <p className="font-bold text-gray-900 text-sm">{selectedRequest.signOff}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Authorizer</p>
                                <p className="font-bold text-gray-900 text-sm">
                                    {users.find(u => u.id === selectedRequest.authorizerId)?.name || 'Unknown'}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 mb-1">Approver (ED)</p>
                                <p className="font-bold text-gray-900 text-sm">
                                    {selectedRequest.approverId 
                                        ? (users.find(u => u.id === selectedRequest.approverId)?.name || 'Unknown') 
                                        : 'Executive Director'}
                                </p>
                            </div>
                        </div>
                     </div>
                </div>

                <div className="p-6 border-t bg-gray-50 text-right space-x-3">
                    <button 
                        onClick={handlePrint} 
                        className="px-4 py-2 bg-brand-dark text-white rounded hover:bg-[#004d61] shadow-sm inline-flex items-center"
                    >
                       <Printer size={16} className="mr-2" /> Download PDF / Print
                    </button>
                    <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 bg-white border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
                        Close
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};
