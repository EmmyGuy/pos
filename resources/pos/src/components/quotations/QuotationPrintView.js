import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useParams } from "react-router-dom";
import { quotationDetailsAction } from "../../store/action/quotationDetails";

const QuotationPrintView = ({ quotationDetailsAction, quotationDetails }) => {
    const { id } = useParams();

    useEffect(() => {
        if (id) {
            quotationDetailsAction(id);

            const timer = setTimeout(() => {
                window.print();
            }, 900);

            return () => clearTimeout(timer);
        }
    }, [id, quotationDetailsAction]);

    if (!quotationDetails) {
        return <div>Loading...</div>;
    }

    return (
        <>
            {/* PRINT STYLES */}
            <style>
                {`
                @media print {

                    @page {
                        size: A4 portrait;
                        margin: 8mm;
                    }

                    body {
                        margin: 0;
                        padding: 0;
                        font-family: Arial, sans-serif;
                        width: 100%;
                        font-size: 16px;        /* Increased */
                    }

                    .print-container {
                        width: 100% !important;
                        max-width: 210mm !important;
                        margin: 0 auto !important;

                        /* ENFORCE CENTERING AGAINST TEMPLATE OVERRIDES */
                        display: block !important;
                        float: none !important;
                        text-align: left !important;

                        padding: 12mm !important;
                        font-family: Arial, sans-serif !important;
                        font-size: 16px !important;
                        line-height: 1.55 !important;
                        background: #fff !important;
                        box-sizing: border-box !important;
                    }


                    .title {
                        text-align: center;
                        font-size: 24px;        /* Larger */
                        font-weight: 900;       /* Bolder */
                        margin-bottom: 18px;
                    }

                    .section-title {
                        font-size: 18px;        /* Larger */
                        font-weight: 800;
                        margin-bottom: 6px;
                        margin-top: 14px;
                    }

                    table {
                        width: 100%;
                        table-layout: fixed;
                        border-collapse: collapse;
                        margin-bottom: 14px;
                    }

                    th {
                        font-weight: 800;       /* Bold headers */
                        font-size: 16px;
                        padding-bottom: 6px;
                        border-bottom: 2px solid #999;
                    }

                    td {
                        font-size: 15px;
                        padding: 6px 4px;
                        border-bottom: 1px solid #ddd;
                    }

                    .total-row {
                        font-size: 17px;
                        font-weight: 700;
                        padding-top: 4px;
                        padding-bottom: 4px;
                    }

                    .grand-total {
                        font-size: 19px;
                        font-weight: 900;       /* Very bold */
                        border-top: 2px solid #000;
                        margin-top: 10px;
                        padding-top: 10px;
                    }

                    .footer {
                        text-align: center;
                        margin-top: 22px;
                        font-size: 17px;
                        font-weight: 700;
                    }

                    button, .btn, .no-print {
                        display: none !important;
                    }
                }
                `}
            </style>


            <div className="print-container">
                {/* TITLE */}
                <h2 className="title">QUOTATION</h2>

                {/* HEADER TABLE */}
                <table>
                    <tbody>
                        <tr>
                            <td><strong>Reference:</strong> {quotationDetails.reference_code}</td>
                            <td style={{ textAlign: "right" }}>
                                <strong>Date:</strong> {quotationDetails.date}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2}><strong>Customer:</strong> {quotationDetails.customer?.name}</td>
                        </tr>
                        <tr>
                            <td colSpan={2}>{quotationDetails.customer?.phone}</td>
                        </tr>
                    </tbody>
                </table>

                {/* ITEMS TITLE */}
                <div className="section-title">Items</div>

                {/* ITEMS TABLE */}
                <table>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Qty × Price</th>
                            <th>Subtotal</th>
                        </tr>
                    </thead>

                    <tbody>
                        {quotationDetails.quotation_items?.map((item, i) => (
                            <tr key={i} className="no-break">
                                <td>{item.product?.name}</td>
                                <td>{item.quantity} × ₦{item.product_price}</td>
                                <td>₦{item.sub_total}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* TOTALS SECTION */}
                <table className="totals-table">
                    <tbody>
                        <tr>
                            <td>Tax</td>
                            <td style={{ textAlign: "right" }}>₦{quotationDetails.tax_amount}</td>
                        </tr>
                        <tr>
                            <td>Discount</td>
                            <td style={{ textAlign: "right" }}>₦{quotationDetails.discount}</td>
                        </tr>
                        <tr>
                            <td>Shipping</td>
                            <td style={{ textAlign: "right" }}>₦{quotationDetails.shipping}</td>
                        </tr>
                        <tr className="grand-total">
                            <td>Grand Total</td>
                            <td style={{ textAlign: "right" }}>₦{quotationDetails.grand_total}</td>
                        </tr>
                    </tbody>
                </table>

                {/* FOOTER */}
                <div className="footer">Thank you</div>
            </div>
        </>
    );
};

const mapStateToProps = (state) => ({
    quotationDetails: state.quotationDetails,
});

export default connect(mapStateToProps, { quotationDetailsAction })(QuotationPrintView);
