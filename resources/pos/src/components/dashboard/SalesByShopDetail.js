import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import MasterLayout from "../MasterLayout";
import apiConfig from "../../config/apiConfig";
import { Table, Card, Form, Button, Row, Col } from "react-bootstrap";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import TabTitle from "../../shared/tab-title/TabTitle";
import { placeholderText } from "../../shared/sharedMethod";

const SalesByShopDetail = () => {
    const { shopName } = useParams();
    const [saleItems, setSaleItems] = useState([]);
    const [filters, setFilters] = useState({
        start_date: "",
        end_date: ""
    });

    // Load XLSX from CDN once
    useEffect(() => {
        if (!window.XLSX) {
            const script = document.createElement("script");
            script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            script.async = true;
            script.onload = () => console.log("XLSX loaded");
            document.body.appendChild(script);
        }
    }, []);

    // Fetch data based on shopName and date filters
    useEffect(() => {
        if (!shopName) return;

        const params = new URLSearchParams();
        if (filters.start_date) params.append("start_date", filters.start_date);
        if (filters.end_date) params.append("end_date", filters.end_date);

        const url = `/sales/shop/${shopName}/items?${params.toString()}`;

        apiConfig
            .get(url)
            .then(({ data }) => {
                // Ensure we handle the data envelope correctly
                setSaleItems(data.data || []);
            })
            .catch((error) => {
                console.error("Failed to load sales items", error);
            });
    }, [shopName, filters]);

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    // Export to Excel
    const exportToExcel = () => {
        if (!window.XLSX) {
            alert("XLSX library not loaded yet.");
            return;
        }

        if (!saleItems.length) {
            alert("No data to export.");
            return;
        }

        const worksheet = window.XLSX.utils.json_to_sheet(saleItems);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

        window.XLSX.writeFile(
            workbook,
            `Sales_${shopName}_${filters.start_date || "Start"}_to_${filters.end_date || "End"}.xlsx`
        );
    };

    // Frontend Totals Calculation
    const totalQuantity = saleItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    const totalSubTotal = saleItems.reduce((acc, item) => acc + Number(item.sub_total || 0), 0);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={`Sales for ${shopName}`} />

            <div className="pt-5 px-3">
                <Card className="shadow-sm">
                    <Card.Header className="bg-white py-3">
                        <Row className="align-items-center g-3">
                            <Col md={4}>
                                <h5 className="mb-0">
                                    {placeholderText("sales.title")} – {shopName}
                                </h5>
                            </Col>
                            <Col md={3}>
                                <Form.Control
                                    type="date"
                                    name="start_date"
                                    value={filters.start_date}
                                    onChange={handleFilterChange}
                                    placeholder="Start Date"
                                />
                            </Col>
                            <Col md={3}>
                                <Form.Control
                                    type="date"
                                    name="end_date"
                                    value={filters.end_date}
                                    onChange={handleFilterChange}
                                    placeholder="End Date"
                                />
                            </Col>
                            <Col md={2} className="text-end">
                                <Button variant="success" className="w-100" onClick={exportToExcel}>
                                    Export Excel
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>

                    <Card.Body>
                        <Table responsive bordered hover className="mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Date</th>
                                    <th>Reference</th>
                                    <th>Customer</th>
                                    <th className="text-end">Grand Total</th>
                                    <th className="text-end">Paid Amount</th>
                                    <th className="text-end">Due Amount</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saleItems.length > 0 ? (
                                    saleItems.map((item, index) => {
                                        const isTotal = item.date === "TOTAL";
                                        return (
                                            <tr key={index} className={isTotal ? "fw-bold table-secondary" : ""}>
                                                <td>{item.date}</td>
                                                <td>{item.sale_ref}</td>
                                                <td>{item.customer_name}</td>
                                                <td className="text-end">{Number(item.grand_total).toFixed(2)}</td>
                                                <td className="text-end text-success">
                                                    {Number(item.paid_amount).toFixed(2)}
                                                </td>
                                                <td className="text-end text-danger">
                                                    {Number(item.due_amount).toFixed(2)}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr><td colSpan="6" className="text-center py-3">No sales found.</td></tr>
                                )}
                            </tbody>
                        </Table>
                    </Card.Body>
                </Card>
            </div>
        </MasterLayout>
    );
};

export default SalesByShopDetail;