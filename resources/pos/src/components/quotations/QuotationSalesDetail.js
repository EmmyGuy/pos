// import React, { useEffect, useState, useMemo } from "react";
// import { Table, Card, Form, Button, Modal, Spinner } from "react-bootstrap";
// import MasterLayout from "../MasterLayout";
// import apiConfig from "../../config/apiConfig";
// import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
// import TabTitle from "../../shared/tab-title/TabTitle";
// import * as XLSX from "xlsx";

// const CustomerTransactions = () => {
//   // Data & filters
//   const [customers, setCustomers] = useState([]);
//   const [customerId, setCustomerId] = useState("");
//   const [selectedCustomer, setSelectedCustomer] = useState(null);
//   const [startDate, setStartDate] = useState("");
//   const [endDate, setEndDate] = useState("");

//   // Backend data
//   const [quotations, setQuotations] = useState([]);
//   const [payments, setPayments] = useState([]);

//   // Loading + pagination
//   const [loading, setLoading] = useState(false);
//   const [quotePage, setQuotePage] = useState(1);
//   const [payPage, setPayPage] = useState(1);
//   const perPage = 10;

//   // Create/Edit Payment modal (reused)
//   const [showPaymentModal, setShowPaymentModal] = useState(false);
//   const [isEditMode, setIsEditMode] = useState(false);
//   const [editingPaymentId, setEditingPaymentId] = useState(null);

//   const [payAmount, setPayAmount] = useState("");
//   const [paymentMethod, setPaymentMethod] = useState("");
//   const [receiptFile, setReceiptFile] = useState(null);
//   const [keepExistingReceipt, setKeepExistingReceipt] = useState(true);

//   // Receipt view modal
//   const [showReceiptModal, setShowReceiptModal] = useState(false);
//   const [receiptUrl, setReceiptUrl] = useState("");

//   // Load customers (role-aware handled by backend)
//   useEffect(() => {
//     const loadCustomers = async () => {
//       try {
//         const { data } = await apiConfig.get("/customer-sales/customers");
//         setCustomers(data.success ? data.customers : []);
//       } catch (err) {
//         console.error("Failed to load customers", err);
//         setCustomers([]);
//       }
//     };
//     loadCustomers();
//   }, []);

//   // Load transactions (quotations + payments)
//   const loadTransactions = async () => {
//     if (!customerId) return alert("Select a customer");

//     setLoading(true);
//     try {
//       const { data } = await apiConfig.get("/customer-sales/transactions", {
//         params: {
//           customer_id: customerId,
//           start_date: startDate || null,
//           end_date: endDate || null,
//         },
//       });

//       if (data.success) {
//         setSelectedCustomer(data.customer || null);
//         setQuotations(data.quotations || []);
//         setPayments(data.payments || []);
//         setQuotePage(1);
//         setPayPage(1);
//       } else {
//         alert(data.message || "No records found");
//         setSelectedCustomer(null);
//         setQuotations([]);
//         setPayments([]);
//       }
//     } catch (err) {
//       console.error("Error loading transactions", err);
//       alert("Error loading transactions. Check console.");
//       setSelectedCustomer(null);
//       setQuotations([]);
//       setPayments([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const clearFilters = () => {
//     setCustomerId("");
//     setStartDate("");
//     setEndDate("");
//     setSelectedCustomer(null);
//     setQuotations([]);
//     setPayments([]);
//     setQuotePage(1);
//     setPayPage(1);
//   };

//   // Excel export
//   const totals = useMemo(() => ({
//     totalQuotation: quotations.reduce((s, q) => s + Number(q.grand_total || 0), 0),
//     totalPayment: payments.reduce((s, p) => s + Number(p.amount_paid || 0), 0),
//   }), [quotations, payments]);

//   const exportExcel = () => {
//     const wsData = [
//       ["Customer", selectedCustomer ? (selectedCustomer.name || selectedCustomer.company_name || `${selectedCustomer.first_name || ""} ${selectedCustomer.last_name || ""}`) : ""],
//       [],
//       ["Balance Summary"],
//       ["Total Quotation", totals.totalQuotation],
//       ["Total Payment", totals.totalPayment],
//       ["Balance", (totals.totalQuotation - totals.totalPayment)],
//       [],
//       ["Quotations"],
//       ["Ref", "Date", "Sales Rep", "Total"],
//       ...quotations.map((q) => [
//         q.reference_code,
//         q.created_at ? new Date(q.created_at).toLocaleDateString() : "",
//         q.user ? `${q.user.first_name || ""} ${q.user.last_name || ""}`.trim() : "",
//         Number(q.grand_total || 0).toFixed(2),
//       ]),
//       [],
//       ["Payments"],
//       ["Date", "Amount", "Method", "Processed By"],
//       ...payments.map((p) => [
//         p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "",
//         Number(p.amount_paid || 0).toFixed(2),
//         p.payment_method || "",
//         p.user ? `${p.user.first_name || ""} ${p.user.last_name || ""}`.trim() : "",
//       ]),
//     ];

//     const ws = XLSX.utils.aoa_to_sheet(wsData);
//     const wb = XLSX.utils.book_new();
//     XLSX.utils.book_append_sheet(wb, ws, "Customer Transactions");
//     XLSX.writeFile(wb, "customer_transactions.xlsx");
//   };

//   // Open create modal
//   const openCreateModal = () => {
//     setIsEditMode(false);
//     setEditingPaymentId(null);
//     setPayAmount("");
//     setPaymentMethod("");
//     setReceiptFile(null);
//     setKeepExistingReceipt(true);
//     setShowPaymentModal(true);
//   };

//   // Open edit modal (reuse)
//   const openEditModal = (payment) => {
//     setIsEditMode(true);
//     setEditingPaymentId(payment.id);
//     setPayAmount(payment.amount_paid?.toString() ?? "");
//     setPaymentMethod(payment.payment_method ?? "");
//     setReceiptFile(null);
//     // when editing, we assume existing receipt is kept unless user uploads a new one
//     setKeepExistingReceipt(true);
//     setShowPaymentModal(true);
//   };

//   // Submit (create or update)
//   const submitPayment = async () => {
//     if (!selectedCustomer) return alert("No customer selected");
//     if (!payAmount || Number(payAmount) <= 0) return alert("Enter a valid amount");

//     const formData = new FormData();
//     formData.append("customer_id", selectedCustomer.id);
//     formData.append("amount_paid", payAmount);
//     formData.append("payment_method", paymentMethod || "");

//     // When reusing reference field to store path (server expects 'reference' or 'receipt'), our backend earlier uses 'receipt' file and stores path in receipt_path.
//     // We submit file under 'receipt' (backend controller checks 'receipt').
//     if (receiptFile) {
//       formData.append("receipt", receiptFile);
//     } else if (isEditMode && !keepExistingReceipt) {
//       // If user explicitly removed existing receipt, send an empty marker
//       formData.append("_remove_receipt", "1");
//     }

//     setLoading(true);

//     try {
//       if (isEditMode && editingPaymentId) {
//         // Update - assumed endpoint: PUT /customer-sales/payment/{id}
//         await apiConfig.post(`/customer-sales/payment/${editingPaymentId}/update`, formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//           // Some servers don't accept POST for update; if your backend expects PUT use:
//           // method override:
//           // formData.append('_method', 'PUT');
//         });
//       } else {
//         // Create
//         await apiConfig.post("/customer-sales/payment", formData, {
//           headers: { "Content-Type": "multipart/form-data" },
//         });
//       }

//       alert("Payment saved");
//       setShowPaymentModal(false);
//       // reload transactions
//       await loadTransactions();
//     } catch (err) {
//       console.error("Failed to save payment", err);
//       alert("Failed to save payment. Check console for details.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Delete payment
//   const deletePayment = async (paymentId) => {
//     if (!window.confirm("Delete this payment? This action cannot be undone.")) return;

//     setLoading(true);
//     try {
//       await apiConfig.delete(`/customer-sales/payment/${paymentId}`);
//       alert("Payment deleted");
//       // reload
//       await loadTransactions();
//     } catch (err) {
//       console.error("Failed to delete payment", err);
//       alert("Failed to delete payment. Check console.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   // View receipt
//   const viewReceipt = (p) => {
//     // prefer p.reference then p.receipt_path
//     const path = p.reference || p.receipt_path || p.receiptPath || null;
//     if (!path) return alert("No receipt available for this payment.");

//     // ensure absolute path for storage; backend stores relative path to storage (e.g. customer-receipts/xxx.pdf)
//     const url = path.startsWith("http") ? path : `/${path.replace(/^\/+/, "")}`;
//     setReceiptUrl(url);
//     setShowReceiptModal(true);
//   };

//   // Pagination slices
//   const paginatedQuotes = useMemo(() => {
//     const start = (quotePage - 1) * perPage;
//     return quotations.slice(start, start + perPage);
//   }, [quotations, quotePage]);

//   const paginatedPayments = useMemo(() => {
//     const start = (payPage - 1) * perPage;
//     return payments.slice(start, start + perPage);
//   }, [payments, payPage]);

//   // balance
//   const balance = totals.totalQuotation - totals.totalPayment;

//   return (
//     <MasterLayout>
//       <TopProgressBar />
//       <TabTitle title="Customer Transactions" />

//       <div className="pt-5 px-3">
//         <Card className="mb-4">
//           <Card.Header>
//             <div className="d-flex flex-wrap gap-3 align-items-center">
//               <Form.Select
//                 style={{ width: 300 }}
//                 value={customerId}
//                 onChange={(e) => setCustomerId(e.target.value)}
//               >
//                 <option value="">-- Select Customer --</option>
//                 {customers.map((c) => (
//                   <option key={c.id} value={c.id}>
//                     {c.name || c.company_name || `${c.first_name || ""} ${c.last_name || ""}`}
//                   </option>
//                 ))}
//               </Form.Select>

//               <Form.Control type="date" style={{ width: 180 }} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
//               <Form.Control type="date" style={{ width: 180 }} value={endDate} onChange={(e) => setEndDate(e.target.value)} />

//               <Button variant="primary" onClick={loadTransactions} disabled={loading}>
//                 {loading ? <Spinner size="sm" /> : "Load"}
//               </Button>

//               <Button variant="warning" onClick={clearFilters}>Clear</Button>

//               <Button variant="success" onClick={openCreateModal} disabled={!customerId}>Create Payment</Button>

//               <Button variant="outline-success" onClick={exportExcel} disabled={quotations.length === 0 && payments.length === 0}>
//                 Export Excel
//               </Button>
//             </div>
//           </Card.Header>
//         </Card>

//         {selectedCustomer && (
//           <Card className="mb-4">
//             <Card.Body>
//               <h5>Balance Summary</h5>
//               <div><strong>Customer:</strong> {selectedCustomer.name || selectedCustomer.company_name || `${selectedCustomer.first_name || ""} ${selectedCustomer.last_name || ""}`}</div>
//               <div><strong>Total Quotations:</strong> ₦{totals.totalQuotation.toFixed(2)}</div>
//               <div><strong>Total Payments:</strong> ₦{totals.totalPayment.toFixed(2)}</div>
//               <div><strong>Balance:</strong> ₦{balance.toFixed(2)}</div>
//             </Card.Body>
//           </Card>
//         )}

//         <div className="d-flex gap-4 flex-wrap">
//           {/* Quotations */}
//           <Card className="flex-fill">
//             <Card.Header>Quotations</Card.Header>
//             <Card.Body>
//               <Table responsive bordered hover>
//                 <thead className="table-light">
//                   <tr>
//                     <th>Ref</th>
//                     <th>Date</th>
//                     <th>Sales Rep</th>
//                     <th className="text-end">Total</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedQuotes.length === 0 ? (
//                     <tr><td colSpan="4" className="text-center">No quotations</td></tr>
//                   ) : (
//                     paginatedQuotes.map(q => (
//                       <tr key={q.id}>
//                         <td>{q.reference_code}</td>
//                         <td>{q.created_at ? new Date(q.created_at).toLocaleDateString() : "—"}</td>
//                         <td>{q.user ? `${q.user.first_name} ${q.user.last_name}` : "N/A"}</td>
//                         <td className="text-end">{Number(q.grand_total || 0).toFixed(2)}</td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>

//               <div className="d-flex justify-content-between">
//                 <div>
//                   <Button size="sm" onClick={() => setQuotePage(p => Math.max(1, p - 1))} disabled={quotePage === 1}>Prev</Button>{" "}
//                   <Button size="sm" onClick={() => setQuotePage(p => p + 1)} disabled={quotePage * perPage >= quotations.length}>Next</Button>
//                 </div>
//                 <div>Page {quotePage}</div>
//               </div>
//             </Card.Body>
//           </Card>

//           {/* Payments */}
//           <Card className="flex-fill">
//             <Card.Header>Payments</Card.Header>
//             <Card.Body>
//               <Table responsive bordered hover>
//                 <thead className="table-light">
//                   <tr>
//                     <th>Date</th>
//                     <th className="text-end">Amount</th>
//                     <th>Method</th>
//                     <th>Processed By</th>
//                     <th>Receipt</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {paginatedPayments.length === 0 ? (
//                     <tr><td colSpan="6" className="text-center">No payments</td></tr>
//                   ) : (
//                     paginatedPayments.map(p => (
//                       <tr key={p.id}>
//                         <td>{p.paid_at ? new Date(p.paid_at).toLocaleDateString() : "—"}</td>
//                         <td className="text-end">{Number(p.amount_paid || 0).toFixed(2)}</td>
//                         <td>{p.payment_method || "N/A"}</td>
//                         <td>{p.user ? `${p.user.first_name} ${p.user.last_name}` : "N/A"}</td>
//                         <td>
//                           {(p.reference || p.receipt_path) ? (
//                             <Button size="sm" variant="link" onClick={() => viewReceipt(p)}>View</Button>
//                           ) : "—"}
//                         </td>
//                         <td>
//                           <Button size="sm" variant="outline-primary" onClick={() => openEditModal(p)}>Edit</Button>{" "}
//                           <Button size="sm" variant="outline-danger" onClick={() => deletePayment(p.id)}>Delete</Button>
//                         </td>
//                       </tr>
//                     ))
//                   )}
//                 </tbody>
//               </Table>

//               <div className="d-flex justify-content-between">
//                 <div>
//                   <Button size="sm" onClick={() => setPayPage(p => Math.max(1, p - 1))} disabled={payPage === 1}>Prev</Button>{" "}
//                   <Button size="sm" onClick={() => setPayPage(p => p + 1)} disabled={payPage * perPage >= payments.length}>Next</Button>
//                 </div>
//                 <div>Page {payPage}</div>
//               </div>
//             </Card.Body>
//           </Card>
//         </div>
//       </div>

//       {/* Create / Edit Payment Modal (reused) */}
//       <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered size="lg">
//         <Modal.Header closeButton>
//           <Modal.Title>{isEditMode ? "Edit Payment" : "Create Payment"}</Modal.Title>
//         </Modal.Header>

//         <Modal.Body>
//           <Form.Group className="mb-3">
//             <Form.Label>Amount Paid</Form.Label>
//             <Form.Control type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Payment Method</Form.Label>
//             <Form.Control value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} placeholder="cash / transfer / bank" />
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Upload Receipt (optional)</Form.Label>
//             <Form.Control type="file" onChange={(e) => setReceiptFile(e.target.files[0])} />
//             {isEditMode && (
//               <div className="mt-2">
//                 <Form.Check
//                   type="checkbox"
//                   label="Keep existing receipt if any (uncheck to remove)"
//                   checked={keepExistingReceipt}
//                   onChange={() => setKeepExistingReceipt(v => !v)}
//                 />
//               </div>
//             )}
//           </Form.Group>
//         </Modal.Body>

//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => { setShowPaymentModal(false); }}>Close</Button>
//           <Button variant="primary" onClick={submitPayment} disabled={loading}>
//             {loading ? <Spinner size="sm" /> : (isEditMode ? "Save Changes" : "Submit Payment")}
//           </Button>
//         </Modal.Footer>
//       </Modal>

//       {/* Receipt view modal */}
//       <Modal show={showReceiptModal} onHide={() => setShowReceiptModal(false)} size="lg" centered>
//         <Modal.Header closeButton>
//           <Modal.Title>Receipt</Modal.Title>
//         </Modal.Header>
//         <Modal.Body style={{ minHeight: 300 }}>
//           {receiptUrl ? (
//             // if pdf, show embed; otherwise show img
//             receiptUrl.toLowerCase().endsWith(".pdf") ? (
//               <iframe src={receiptUrl} title="receipt" style={{ width: "100%", minHeight: 400 }} />
//             ) : (
//               <img src={receiptUrl} alt="receipt" style={{ maxWidth: "100%", height: "auto" }} />
//             )
//           ) : (
//             <div className="text-center text-muted">No receipt available</div>
//           )}
//         </Modal.Body>
//       </Modal>
//     </MasterLayout>
//   );
// };

// export default CustomerTransactions;
