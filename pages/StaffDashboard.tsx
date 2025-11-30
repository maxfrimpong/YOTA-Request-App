
import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { RequestStatus, Role, RequestFile, PaymentRequest, BillingItem } from '../types';
import { PlusCircle, Upload, CheckCircle, XCircle, Clock, AlertCircle, Eye, FileText, Download, X, Edit3, CreditCard, Smartphone, Landmark, Briefcase, FileType, Plus, Trash2, Printer } from 'lucide-react';
import { printPaymentRequest } from '../utils/pdfGenerator';

export const StaffDashboard = () => {
  const { user, requests, users, addRequest, editRequest, systemLists, logoUrl } = useApp();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
  
  // View Details State
  const [selectedRequest, setSelectedRequest] = useState<PaymentRequest | null>(null);
  const [previewFile, setPreviewFile] = useState<RequestFile | null>(null);

  // Form State
  const [vendor, setVendor] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('GHS');
  const [billingProject, setBillingProject] = useState('');
  const [requestSubject, setRequestSubject] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAuthorizer, setSelectedAuthorizer] = useState('');
  const [signOff, setSignOff] = useState('');
  const [files, setFiles] = useState<{name: string, type: 'memo'|'invoice'|'other'}[]>([]);

  // Billing Items Table State
  const [billingItems, setBillingItems] = useState<BillingItem[]>([
      { description: '', unitCost: 0, quantity: 1, frequency: 1 }
  ]);
  const [whtPercentage, setWhtPercentage] = useState<string>('0');
  const [calculatedSubTotal, setCalculatedSubTotal] = useState(0);
  const [calculatedWhtAmount, setCalculatedWhtAmount] = useState(0);
  const [calculatedGrandTotal, setCalculatedGrandTotal] = useState(0);

  // Payment Details State
  const [paymentMethod, setPaymentMethod] = useState(''); // Initialized empty, set in useEffect
  
  // Momo Fields
  const [momoOperator, setMomoOperator] = useState('');
  const [momoNumber, setMomoNumber] = useState('');
  
  // Bank Fields
  const [bankName, setBankName] = useState('');
  const [accName, setAccName] = useState('');
  const [accNumber, setAccNumber] = useState('');
  const [branchName, setBranchName] = useState('');
  const [sortCode, setSortCode] = useState('');
  const [swift, setSwift] = useState('');
  
  // Generic Fields (for other methods)
  const [genericPaymentDetails, setGenericPaymentDetails] = useState('');

  // Refs for file inputs
  const invoiceInputRef = useRef<HTMLInputElement>(null);

  // Filter users who have the AUTHORIZER role
  const authorizers = users.filter(u => u.roles.includes(Role.AUTHORIZER));
  const myRequests = requests.filter(r => r.requesterId === user?.id);

  // Defaults
  useEffect(() => {
      if (systemLists.paymentMethods.length > 0 && !paymentMethod) {
          setPaymentMethod(systemLists.paymentMethods[0]);
      }
      if (systemLists.momoOperators.length > 0 && !momoOperator) {
          setMomoOperator(systemLists.momoOperators[0]);
      }
      if (systemLists.currencies.length > 0 && !currency) {
          setCurrency(systemLists.currencies[0]);
      }
  }, [systemLists]);

  // Calculations for Billing Table
  useEffect(() => {
    const subTotal = billingItems.reduce((acc, item) => {
        return acc + (item.unitCost * item.quantity * item.frequency);
    }, 0);

    const taxP = parseFloat(whtPercentage) || 0;
    const taxAmt = subTotal * (taxP / 100);
    const grandTotal = subTotal - taxAmt; // WHT is deducted from total payable

    setCalculatedSubTotal(subTotal);
    setCalculatedWhtAmount(taxAmt);
    setCalculatedGrandTotal(grandTotal);

    // Update main amount if items exist
    if (subTotal > 0) {
        setAmount(grandTotal.toFixed(2));
    }
  }, [billingItems, whtPercentage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'memo' | 'invoice') => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setFiles(prev => [...prev, { name: fileName, type }]);
    }
  };

  const handleBillingItemChange = (index: number, field: keyof BillingItem, value: string) => {
      const newItems = [...billingItems];
      if (field === 'description') {
          newItems[index][field] = value;
      } else {
          newItems[index][field] = parseFloat(value) || 0;
      }
      setBillingItems(newItems);
  };

  const addBillingItem = () => {
      setBillingItems([...billingItems, { description: '', unitCost: 0, quantity: 1, frequency: 1 }]);
  };

  const removeBillingItem = (index: number) => {
      if (billingItems.length > 1) {
        const newItems = [...billingItems];
        newItems.splice(index, 1);
        setBillingItems(newItems);
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
      setBillingProject(req.billingProject || '');
      setRequestSubject(req.requestSubject || '');
      setDescription(req.description);
      setSelectedAuthorizer(req.authorizerId);
      setSignOff(req.signOff);
      setFiles(req.files.map(f => ({ name: f.name, type: f.type })));
      
      // Billing items
      if (req.billingItems && req.billingItems.length > 0) {
          setBillingItems(req.billingItems);
      } else {
          setBillingItems([{ description: '', unitCost: 0, quantity: 1, frequency: 1 }]);
      }
      setWhtPercentage(req.withholdingTaxPercentage ? req.withholdingTaxPercentage.toString() : '0');

      // Attempt to parse payment details
      const details = req.paymentDetails || '';
      
      // Determine method from details string prefix
      let foundMethod = systemLists.paymentMethods.find(m => details.startsWith(m));
      
      // Fallback detection
      if (!foundMethod) {
          if (details.includes('Mobile Money') || details.includes('Momo')) foundMethod = 'Mobile Money';
          else if (details.includes('Bank')) foundMethod = 'Bank Account';
          else foundMethod = systemLists.paymentMethods[0];
      }

      setPaymentMethod(foundMethod || '');

      if (details.includes('Mobile Money') || details.includes('Momo')) {
          // Format: Mobile Money - OPERATOR: NUMBER
          const parts = details.split(':');
          if (parts.length >= 2) {
              const opPart = parts[0].split('-')[1]?.trim();
              if (opPart) setMomoOperator(opPart);
              setMomoNumber(parts[1]?.trim() || '');
          }
      } else if (details.includes('Bank')) {
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
          setGenericPaymentDetails(details);
      }

      setIsFormOpen(true);
  };

  const isMomoMethod = (method: string) => {
      const m = method.toLowerCase();
      return m.includes('mobile') || m.includes('momo');
  };

  const isBankMethod = (method: string) => {
      const m = method.toLowerCase();
      return m.includes('bank');
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
    if (isMomoMethod(paymentMethod)) {
        finalPaymentDetails = `${paymentMethod} - ${momoOperator}: ${momoNumber}`;
    } else if (isBankMethod(paymentMethod)) {
        finalPaymentDetails = `${paymentMethod} - Bank: ${bankName}, Name: ${accName}, No: ${accNumber}, Branch: ${branchName}, Code: ${sortCode}, SWIFT: ${swift}`;
    } else {
        finalPaymentDetails = `${paymentMethod} - ${genericPaymentDetails}`;
    }
    
    // Filter out empty billing items
    const validBillingItems = billingItems.filter(item => item.description.trim() !== '');

    setLoading(true);
    // Simulate API delay
    setTimeout(() => {
      const commonData = {
            vendorName: vendor,
            amount: parseFloat(amount),
            currency,
            billingProject,
            requestSubject,
            description,
            billingItems: validBillingItems,
            withholdingTaxPercentage: parseFloat(whtPercentage),
            paymentDetails: finalPaymentDetails,
            authorizerId: selectedAuthorizer,
            signOff,
            files: files.map(f => ({ ...f, url: '#' })) 
      };

      if (editingRequestId) {
        // Edit Mode
        editRequest(editingRequestId, commonData);
      } else {
        // Create Mode
        addRequest({
            requesterId: user.id,
            requesterName: user.name,
            department: user.department,
            position: user.position || 'Staff',
            ...commonData
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
    setCurrency(systemLists.currencies[0] || 'GHS');
    setBillingProject('');
    setRequestSubject('');
    setDescription('');
    setSelectedAuthorizer('');
    setSignOff('');
    setFiles([]);
    setEditingRequestId(null);
    setBillingItems([{ description: '', unitCost: 0, quantity: 1, frequency: 1 }]);
    setWhtPercentage('0');
    setCalculatedSubTotal(0);
    setCalculatedWhtAmount(0);
    setCalculatedGrandTotal(0);
    
    // Reset Payment fields
    setPaymentMethod(systemLists.paymentMethods[0] || '');
    setMomoOperator(systemLists.momoOperators[0] || '');
    setMomoNumber('');
    setBankName('');
    setAccName('');
    setAccNumber('');
    setBranchName('');
    setSortCode('');
    setSwift('');
    setGenericPaymentDetails('');
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

  const handlePrintPdf = () => {
      if (!selectedRequest) return;
      printPaymentRequest(selectedRequest, users, logoUrl);
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject / Vendor</th>
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      <div className="flex flex-col">
                        <span>{req.requestSubject}</span>
                        <span className="text-xs text-gray-500 font-normal">{req.vendorName}</span>
                      </div>
                    </td>
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
                        <div className="col-span-2">
                           <label className="block text-sm font-medium text-gray-500">Subject</label>
                           <p className="text-gray-900 font-bold text-lg">{selectedRequest.requestSubject}</p>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-500">Billing Project</label>
                           <p className="text-brand-teal font-medium">{selectedRequest.billingProject}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Date Submitted</label>
                            <p className="text-gray-900">{new Date(selectedRequest.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-500">Vendor</label>
                            <p className="text-gray-900 font-medium">{selectedRequest.vendorName}</p>
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

                     {/* Display Billing Items if available */}
                     {selectedRequest.billingItems && selectedRequest.billingItems.length > 0 && (
                         <div>
                             <label className="block text-sm font-medium text-gray-500 mb-2">Billing Items</label>
                             <div className="border border-gray-200 rounded-lg overflow-hidden">
                                 <table className="min-w-full divide-y divide-gray-200">
                                     <thead className="bg-gray-50">
                                         <tr>
                                             <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                             <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Unit Cost</th>
                                             <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                                             <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Freq</th>
                                             <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                                         </tr>
                                     </thead>
                                     <tbody className="divide-y divide-gray-200 bg-white">
                                         {selectedRequest.billingItems.map((item, idx) => (
                                             <tr key={idx}>
                                                 <td className="px-3 py-2 text-sm text-gray-900">{item.description}</td>
                                                 <td className="px-3 py-2 text-sm text-gray-500 text-right">{item.unitCost.toLocaleString()}</td>
                                                 <td className="px-3 py-2 text-sm text-gray-500 text-right">{item.quantity}</td>
                                                 <td className="px-3 py-2 text-sm text-gray-500 text-right">{item.frequency}</td>
                                                 <td className="px-3 py-2 text-sm text-gray-900 text-right">{(item.unitCost * item.quantity * item.frequency).toLocaleString()}</td>
                                             </tr>
                                         ))}
                                         {/* Calculation Footer */}
                                         {(() => {
                                             const subTotal = selectedRequest.billingItems.reduce((acc, i) => acc + (i.unitCost * i.quantity * i.frequency), 0);
                                             const tax = subTotal * ((selectedRequest.withholdingTaxPercentage || 0) / 100);
                                             const grandTotal = subTotal - tax;
                                             return (
                                                <>
                                                 <tr className="bg-gray-50 font-medium">
                                                     <td colSpan={4} className="px-3 py-2 text-right text-sm">Sub-Total</td>
                                                     <td className="px-3 py-2 text-right text-sm">{selectedRequest.currency} {subTotal.toLocaleString()}</td>
                                                 </tr>
                                                 <tr className="bg-gray-50">
                                                     <td colSpan={4} className="px-3 py-2 text-right text-sm text-gray-500">Withholding Tax ({selectedRequest.withholdingTaxPercentage || 0}%)</td>
                                                     <td className="px-3 py-2 text-right text-sm text-red-500">-{selectedRequest.currency} {tax.toLocaleString()}</td>
                                                 </tr>
                                                 <tr className="bg-gray-100 font-bold border-t border-gray-200">
                                                     <td colSpan={4} className="px-3 py-2 text-right text-sm">Grand Total Due</td>
                                                     <td className="px-3 py-2 text-right text-sm text-brand-teal">{selectedRequest.currency} {grandTotal.toLocaleString()}</td>
                                                 </tr>
                                                </>
                                             )
                                         })()}
                                     </tbody>
                                 </table>
                             </div>
                         </div>
                     )}
                     
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
                    {selectedRequest.status === RequestStatus.APPROVED && (
                        <button 
                            onClick={handlePrintPdf}
                            className="px-4 py-2 bg-brand-dark text-white rounded hover:bg-[#004d61] shadow-sm inline-flex items-center"
                        >
                            <Printer size={16} className="mr-2" /> Download PDF
                        </button>
                    )}

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

      {/* New/Edit Request Modal - Updated Structure for scroll fix */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50">
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl relative">
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
                    <label className="block text-sm font-medium text-gray-700">Amount (Currency)</label>
                    <div className="flex mt-1">
                        <select 
                            className="block rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal sm:text-sm"
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                        >
                            {systemLists.currencies.map(c => (
                                <option key={c} value={c}>{c}</option>
                            ))}
                        </select>
                        <input required type="number" step="0.01" className="block w-full rounded-r-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal bg-gray-50 text-gray-600 cursor-not-allowed"
                            value={amount} readOnly title="Amount is calculated from Billing Items" />
                    </div>
                    </div>

                    {/* New Billing Project Field */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Billing Project</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Briefcase size={16} className="text-gray-400" />
                            </div>
                            <select 
                                required
                                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={billingProject} 
                                onChange={e => setBillingProject(e.target.value)}
                            >
                                <option value="">Select Project</option>
                                {systemLists.billingProjects.map(p => (
                                    <option key={p} value={p}>{p}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* New Request Subject Field */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">Request Subject</label>
                        <div className="relative mt-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FileType size={16} className="text-gray-400" />
                            </div>
                            <input 
                                required 
                                type="text" 
                                placeholder="e.g., Q3 Marketing Brochure Printing"
                                className="pl-10 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                value={requestSubject} 
                                onChange={e => setRequestSubject(e.target.value)} 
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description / Memo Content</label>
                    <textarea required rows={4} className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                    placeholder="Explain the purpose of this payment..."
                    value={description} onChange={e => setDescription(e.target.value)} />
                </div>

                {/* Editable Billing Items Table */}
                <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm">
                    <div className="p-3 bg-gray-50 border-b border-gray-200 flex justify-between items-center">
                        <h4 className="text-sm font-bold text-gray-800">Billing Items</h4>
                        <button type="button" onClick={addBillingItem} className="text-xs flex items-center bg-brand-teal text-white px-2 py-1 rounded hover:bg-[#008f7a]">
                            <Plus size={14} className="mr-1"/> Add Item
                        </button>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Item Description</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost ({currency})</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Freq</th>
                                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total ({currency})</th>
                                    <th className="px-4 py-2 w-10"></th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {billingItems.map((item, index) => (
                                    <tr key={index}>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="text" 
                                                placeholder="Item name"
                                                className="w-full border-0 border-b border-transparent focus:border-brand-teal focus:ring-0 text-sm p-1"
                                                value={item.description}
                                                onChange={(e) => handleBillingItemChange(index, 'description', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                            <input 
                                                type="number" 
                                                min="0"
                                                step="0.01"
                                                className="w-full border-gray-200 rounded text-sm p-1 focus:ring-brand-teal focus:border-brand-teal"
                                                value={item.unitCost}
                                                onChange={(e) => handleBillingItemChange(index, 'unitCost', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                             <input 
                                                type="number" 
                                                min="1"
                                                className="w-20 border-gray-200 rounded text-sm p-1 focus:ring-brand-teal focus:border-brand-teal"
                                                value={item.quantity}
                                                onChange={(e) => handleBillingItemChange(index, 'quantity', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2">
                                             <input 
                                                type="number" 
                                                min="1"
                                                className="w-20 border-gray-200 rounded text-sm p-1 focus:ring-brand-teal focus:border-brand-teal"
                                                value={item.frequency}
                                                onChange={(e) => handleBillingItemChange(index, 'frequency', e.target.value)}
                                            />
                                        </td>
                                        <td className="px-4 py-2 text-right text-sm font-medium text-gray-900">
                                            {(item.unitCost * item.quantity * item.frequency).toLocaleString()}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            {billingItems.length > 1 && (
                                                <button type="button" onClick={() => removeBillingItem(index)} className="text-gray-400 hover:text-red-500">
                                                    <Trash2 size={16} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-gray-50 border-t border-gray-200">
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-700">Sub-Total</td>
                                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-900">{currency} {calculatedSubTotal.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                                        <div className="flex items-center justify-end space-x-2">
                                            <span>Withholding Tax (%)</span>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                max="100" 
                                                step="0.1"
                                                className="w-16 border-gray-300 rounded text-xs p-1 text-right focus:ring-brand-teal focus:border-brand-teal"
                                                value={whtPercentage}
                                                onChange={(e) => setWhtPercentage(e.target.value)}
                                            />
                                        </div>
                                    </td>
                                    <td className="px-4 py-2 text-right text-sm font-medium text-red-500">
                                        - {currency} {calculatedWhtAmount.toLocaleString()}
                                    </td>
                                    <td></td>
                                </tr>
                                <tr>
                                    <td colSpan={4} className="px-4 py-2 text-right text-sm font-medium text-gray-700">Sub-Total after Withholding Tax</td>
                                    <td className="px-4 py-2 text-right text-sm font-bold text-gray-800">{currency} {calculatedGrandTotal.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                                <tr className="bg-brand-teal/5">
                                    <td colSpan={4} className="px-4 py-3 text-right text-sm font-bold text-brand-teal uppercase">Grand Total Due</td>
                                    <td className="px-4 py-3 text-right text-base font-bold text-brand-teal">{currency} {calculatedGrandTotal.toLocaleString()}</td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Structured Payment Details */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center">
                        <CreditCard size={16} className="mr-2" /> Payment Details
                    </h4>
                    
                    <div className="mb-4">
                        <label className="block text-xs font-semibold text-gray-500 uppercase mb-1">Payment Method</label>
                        <select 
                            className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal sm:text-sm"
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                        >
                            {systemLists.paymentMethods.map(m => (
                                <option key={m} value={m}>{m}</option>
                            ))}
                        </select>
                    </div>

                    {isMomoMethod(paymentMethod) ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
                            <div>
                                <label className="block text-sm font-medium text-gray-700">Network Operator</label>
                                <select 
                                    required 
                                    className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal sm:text-sm"
                                    value={momoOperator}
                                    onChange={(e) => setMomoOperator(e.target.value)}
                                >
                                    {systemLists.momoOperators.map(op => (
                                        <option key={op} value={op}>{op}</option>
                                    ))}
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
                    ) : isBankMethod(paymentMethod) ? (
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
                    ) : (
                        // Generic Fallback for unknown methods
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="block text-sm font-medium text-gray-700">Payment Details</label>
                            <textarea 
                                required 
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-brand-teal focus:ring-1 focus:ring-brand-teal"
                                rows={3}
                                placeholder="Enter relevant payment information..."
                                value={genericPaymentDetails}
                                onChange={(e) => setGenericPaymentDetails(e.target.value)}
                            />
                        </div>
                    )}
                </div>


                <div className="grid grid-cols-1 gap-6">
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
