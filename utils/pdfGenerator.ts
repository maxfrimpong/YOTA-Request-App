
import { PaymentRequest, User } from '../types';

export const printPaymentRequest = (selectedRequest: PaymentRequest, users: User[], logoUrl: string) => {
    if (!selectedRequest) return;
    
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=900,height=800');
    if (!printWindow) return;

    const requester = users.find(u => u.id === selectedRequest.requesterId)?.name || selectedRequest.requesterName;
    const authorizer = users.find(u => u.id === selectedRequest.authorizerId)?.name || 'Unknown Authorizer';
    const approver = selectedRequest.approverId ? users.find(u => u.id === selectedRequest.approverId)?.name : 'Executive Director';

    const subTotal = selectedRequest.billingItems?.reduce((acc, item) => acc + (item.unitCost * item.quantity * item.frequency), 0) || 0;
    const tax = subTotal * ((selectedRequest.withholdingTaxPercentage || 0) / 100);
    const grandTotal = subTotal - tax;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Payment Request - ${selectedRequest.requestSubject}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
          .header { display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #006680; padding-bottom: 20px; margin-bottom: 30px; }
          .logo { max-height: 60px; }
          .title { font-size: 24px; font-weight: bold; color: #006680; text-transform: uppercase; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 30px; }
          .meta-item { font-size: 14px; }
          .meta-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; display: block; margin-bottom: 4px; }
          .meta-value { font-weight: bold; font-size: 15px; }
          .section-title { font-size: 16px; font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-bottom: 10px; margin-top: 20px; color: #00a88f; }
          .description { background: #f9f9f9; padding: 15px; border-radius: 4px; border: 1px solid #eee; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
          th { text-align: left; background: #006680; color: white; padding: 8px; font-size: 12px; text-transform: uppercase; }
          td { border-bottom: 1px solid #eee; padding: 8px; font-size: 13px; }
          .text-right { text-align: right; }
          .totals-section { margin-top: 20px; display: flex; justify-content: flex-end; }
          .totals-table { width: 300px; }
          .grand-total { font-size: 16px; font-weight: bold; color: #006680; }
          .signatures { margin-top: 60px; display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 30px; }
          .sig-box { border-top: 1px solid #333; padding-top: 10px; text-align: center; }
          .sig-role { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 1px; }
          .sig-name { font-weight: bold; font-size: 14px; margin-bottom: 40px; font-family: 'Courier New', monospace; }
        </style>
      </head>
      <body>
        <div class="header">
           <img src="${logoUrl}" class="logo" alt="Logo" />
           <div class="title">Payment Request Voucher</div>
        </div>

        <div class="meta-grid">
           <div class="meta-item">
              <span class="meta-label">Request ID</span>
              <span class="meta-value">#${selectedRequest.id}</span>
           </div>
           <div class="meta-item">
              <span class="meta-label">Date Approved</span>
              <span class="meta-value">${new Date(selectedRequest.updatedAt).toLocaleDateString()}</span>
           </div>
           <div class="meta-item">
              <span class="meta-label">Subject</span>
              <span class="meta-value">${selectedRequest.requestSubject}</span>
           </div>
           <div class="meta-item">
              <span class="meta-label">Billing Project</span>
              <span class="meta-value">${selectedRequest.billingProject}</span>
           </div>
           <div class="meta-item">
              <span class="meta-label">Vendor</span>
              <span class="meta-value">${selectedRequest.vendorName}</span>
           </div>
           <div class="meta-item">
              <span class="meta-label">Payment Details</span>
              <span class="meta-value" style="font-family: monospace; font-size: 13px;">${selectedRequest.paymentDetails}</span>
           </div>
        </div>

        <div class="section-title">Description</div>
        <div class="description">${selectedRequest.description}</div>

        <div class="section-title">Billing Items</div>
        <table>
           <thead>
             <tr>
               <th>Item</th>
               <th class="text-right">Unit Cost</th>
               <th class="text-right">Qty</th>
               <th class="text-right">Freq</th>
               <th class="text-right">Total</th>
             </tr>
           </thead>
           <tbody>
             ${selectedRequest.billingItems ? selectedRequest.billingItems.map(item => `
               <tr>
                 <td>${item.description}</td>
                 <td class="text-right">${item.unitCost.toLocaleString()}</td>
                 <td class="text-right">${item.quantity}</td>
                 <td class="text-right">${item.frequency}</td>
                 <td class="text-right">${(item.unitCost * item.quantity * item.frequency).toLocaleString()}</td>
               </tr>
             `).join('') : ''}
           </tbody>
        </table>

        <div class="totals-section">
           <table class="totals-table">
              <tr>
                 <td class="text-right">Sub-Total:</td>
                 <td class="text-right"><b>${selectedRequest.currency} ${subTotal.toLocaleString()}</b></td>
              </tr>
              <tr>
                 <td class="text-right">Withholding Tax (${selectedRequest.withholdingTaxPercentage || 0}%):</td>
                 <td class="text-right" style="color: #fa4515;">- ${selectedRequest.currency} ${tax.toLocaleString()}</td>
              </tr>
              <tr>
                 <td class="text-right grand-total">Grand Total:</td>
                 <td class="text-right grand-total">${selectedRequest.currency} ${grandTotal.toLocaleString()}</td>
              </tr>
           </table>
        </div>

        <div class="signatures">
           <div class="sig-box">
              <div class="sig-name">${selectedRequest.signOff}</div>
              <div class="sig-role">Requester</div>
           </div>
           <div class="sig-box">
              <div class="sig-name">${authorizer}</div>
              <div class="sig-role">Authorizer</div>
           </div>
           <div class="sig-box">
              <div class="sig-name">${approver || 'Executive Director'}</div>
              <div class="sig-role">Approver</div>
           </div>
        </div>

        <div style="margin-top: 40px; font-size: 11px; color: #999; text-align: center;">
           Generated by SendREQ System on ${new Date().toLocaleString()}
        </div>

        <script>
            window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
};
