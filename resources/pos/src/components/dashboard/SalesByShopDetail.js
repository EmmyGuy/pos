import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import MasterLayout from "../MasterLayout";
import apiConfig from "../../config/apiConfig";
import { Table, Card, Form, Button } from "react-bootstrap";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchAllVariations } from "../../store/action/variationAction";
import { placeholderText } from "../../shared/sharedMethod";

const SalesByShopDetail = () => {
    const { shopName } = useParams();
    const dispatch = useDispatch();

    const [saleItems, setSaleItems] = useState([]);
    const [selectedVariation, setSelectedVariation] = useState("");

    const allVariations = useSelector((state) => state.variations || []);

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

    useEffect(() => {
        dispatch(fetchAllVariations());
    }, [dispatch]);

    useEffect(() => {
        const url = selectedVariation
            ? `/sales/shop/${shopName}/items?variation_id=${selectedVariation}`
            : `/sales/shop/${shopName}/items`;

        apiConfig
            .get(url)
            .then(({ data }) => {
                setSaleItems(data.data);
            })
            .catch((error) => {
                console.error("Failed to load sales items", error);
            });
    }, [shopName, selectedVariation]);

    const variationOptions = allVariations.map((variation) => ({
        id: variation.id,
        name: variation.attributes?.name || variation.name || "Unnamed",
    }));

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
            `Sales_${shopName}_${selectedVariation || "All"}.xlsx`
        );
    };

    // Totals
    const totalQuantity = saleItems.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    const totalUnitPrice = saleItems.reduce((acc, item) => acc + Number(item.price || 0), 0);
    const totalSubTotal = saleItems.reduce((acc, item) => acc + Number(item.sub_total || 0), 0);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={`Sales for ${shopName}`} />

            <div className="pt-5 px-3">
                <Card>
                    <Card.Header className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                        <h5 className="mb-0">
                            {placeholderText("sales.title")} – {shopName}
                        </h5>
                        <div className="d-flex align-items-center gap-2">
                            <Form.Select
                                style={{ width: "250px" }}
                                value={selectedVariation}
                                onChange={(e) => setSelectedVariation(e.target.value)}
                            >
                                <option value="">-- Select Variation --</option>
                                {variationOptions.map((variation) => (
                                    <option key={variation.id} value={variation.id}>
                                        {variation.name}
                                    </option>
                                ))}
                            </Form.Select>
                            <Button variant="success" onClick={exportToExcel}>
                                Export to Excel
                            </Button>
                        </div>
                    </Card.Header>

                    <Card.Body>
                        <Table responsive bordered hover>
                            <thead className="table-light">
                                <tr>
                                    <th>Sale ID</th>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Sub Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {saleItems.length > 0 ? (
                                    saleItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.sale_id}</td>
                                            <td>{item.product_name}</td>
                                            <td>{item.quantity}</td>
                                            <td>{item.price}</td>
                                            <td>{item.sub_total}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">
                                            No sale items found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                            {saleItems.length > 0 && (
                                <tfoot>
                                    <tr className="fw-bold">
                                        <td colSpan="2" className="text-end">Total</td>
                                        <td>{totalQuantity}</td>
                                        <td>{totalUnitPrice.toFixed(2)}</td>
                                        <td>{totalSubTotal.toFixed(2)}</td>
                                    </tr>
                                </tfoot>
                            )}
                        </Table>
                    </Card.Body>
                </Card>
            </div>
        </MasterLayout>
    );
};

export default SalesByShopDetail;
