import React, { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Card, Form, Button } from "react-bootstrap";
import MasterLayout from "../MasterLayout";
import apiConfig from "../../config/apiConfig";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import TabTitle from "../../shared/tab-title/TabTitle";
import { fetchAllVariations } from "../../store/action/variationAction";

const ProductStockDetail = () => {
  const dispatch = useDispatch();
  const [productStocks, setProductStocks] = useState([]);
  const [selectedVariation, setSelectedVariation] = useState("");
  const [selectedWarehouse, setSelectedWarehouse] = useState("");
  const [warehouses, setWarehouses] = useState([]);
  const allVariations = useSelector((state) => state.variations || []);

  useEffect(() => {
    if (!window.XLSX) {
      const script = document.createElement("script");
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.async = true;
      script.onload = () => console.log("XLSX loaded");
      document.body.appendChild(script);
    }
  }, []);

  useEffect(() => {
    dispatch(fetchAllVariations());
  }, [dispatch]);

  useEffect(() => {
    apiConfig
      .get("/warehouses")
      .then(({ data }) => {
        setWarehouses(data.data);
      })
      .catch((error) => console.error("Failed to load warehouses", error));
  }, []);

  const variationOptions = allVariations.map((variation) => ({
    id: variation.id,
    name: variation.attributes?.name || variation.name || "Unnamed",
  }));

  const warehouseOptions = warehouses.map((warehouse) => ({
    id: warehouse.id,
    name: warehouse.attributes?.name || "Unnamed",
  }));

  const loadProductStocks = () => {
    let url = `/stocks/products?`;
    if (selectedVariation) url += `variation_id=${selectedVariation}&`;
    if (selectedWarehouse) url += `warehouse_id=${selectedWarehouse}`;
    apiConfig
      .get(url)
      .then(({ data }) => {
        const stocksWithKey = data.data.map((stock) => ({
          ...stock,
          uniqueKey: `${stock.product?.id || "noProdId"}-${stock.warehouse_id || "noWarehouse"}`,
          // ensure physical_stock is present
          physical_stock: stock.physical_stock || 0,
        }));
        setProductStocks(stocksWithKey);
      })
      .catch((error) =>
        console.error("Failed to load product stock items", error)
      );
  };

  const exportToExcel = () => {
    if (!window.XLSX) {
      alert("XLSX library not loaded yet.");
      return;
    }
    if (!productStocks.length) {
      alert("No data to export.");
      return;
    }
    const worksheet = window.XLSX.utils.json_to_sheet(productStocks);
    const workbook = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(workbook, worksheet, "ProductStocks");
    window.XLSX.writeFile(
      workbook,
      `ProductStocks_${selectedVariation || "All"}_${
        selectedWarehouse || "All"
      }.xlsx`
    );
  };

  const updatePhysicalStock = (uniqueKey, productId, newPhysicalStock) => {
    apiConfig
      .put(`/stocks/products/${productId}`, { physical_stock: newPhysicalStock })
      .then(() => {
        setProductStocks((prevStocks) =>
          prevStocks.map((stock) =>
            stock.uniqueKey === uniqueKey
              ? { ...stock, physical_stock: Number(newPhysicalStock) }
              : stock
          )
        );
      })
      .catch((error) => {
        console.error("Failed to update physical stock", error);
        alert("Failed to update the stock value. Please try again.");
      });
  };

  const handleStockChange = (uniqueKey, e) => {
    const newValue = e.target.value;
    setProductStocks((prevStocks) =>
      prevStocks.map((stock) =>
        stock.uniqueKey === uniqueKey
          ? { ...stock, physical_stock: Number(newValue) }
          : stock
      )
    );
  };

  // Totals and summations
  const totalPhysicalStock = productStocks.reduce(
    (total, stock) => total + Number(stock.physical_stock || 0),
    0
  );
  const totalSystemStock = productStocks.reduce(
    (total, stock) => total + Number(stock.quantity || 0),
    0
  );

  const totalValue = useMemo(
    () =>
      productStocks.reduce(
        (sum, stock) => sum + stock.quantity * (stock.product?.product_price || 0),
        0
      ),
    [productStocks]
  );

  const totalUpdatedValue = useMemo(
    () =>
      productStocks.reduce(
        (sum, stock) => sum + stock.physical_stock * (stock.product?.product_price || 0),
        0
      ),
    [productStocks]
  );

  // New selling price total if needed
  const totalSelling = useMemo(
    () =>
      productStocks.reduce(
        (sum, stock) => sum + stock.quantity * (stock.product?.product_price || 0),
        0
      ),
    [productStocks]
  );

  return (
    <MasterLayout>
      <TopProgressBar />
      <TabTitle title="Product Stock Details" />
      <div className="pt-5 px-3">
        <Card>
          <Card.Header className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <h5 className="mb-0">Product Stock Details</h5>
            <div className="d-flex gap-2 align-items-center">
              <Form.Select
                style={{ width: "200px" }}
                value={selectedWarehouse}
                onChange={(e) => setSelectedWarehouse(e.target.value)}
              >
                <option value="">-- Select Warehouse --</option>
                {warehouseOptions.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Select
                style={{ width: "200px" }}
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
              <Button variant="primary" onClick={loadProductStocks}>
                Load Stock
              </Button>
              <Button variant="success" onClick={exportToExcel}>
                Export to Excel
              </Button>
            </div>
          </Card.Header>
          <Card.Body>
            <Table responsive bordered hover>
              <thead className="table-light">
                <tr>
                  <th>Category Name</th>
                  <th>Product Name</th>
                  <th>Code</th>
                  <th>Physical Stock</th>
                  <th>System Stock</th>
                  <th>Unit Price</th>
                  <th>Selling Price</th>
                  <th>Total Value</th>
                  <th>Updated Total Value</th>
                  <th>Difference</th>
                </tr>
              </thead>
              <tbody>
                {productStocks.length > 0 ? (
                  <>
                    {productStocks.map((stock) => {
                      const updatedValue = stock.physical_stock * (stock.product?.product_price || 0);
                      const difference = stock.physical_stock - stock.quantity;
                      return (
                        <tr key={stock.uniqueKey}>
                          <td>{stock.product_category_name}</td>
                          <td>{stock.product?.name}</td>
                          <td>{stock.product?.code}</td>
                          <td>
                            <input
                              type="number"
                              className="form-control"
                              value={stock.physical_stock}
                              onChange={(e) => handleStockChange(stock.uniqueKey, e)}
                              onBlur={(e) => updatePhysicalStock(
                                stock.uniqueKey,
                                stock.product?.id,
                                e.target.value
                              )}
                            />
                          </td>
                          <td>{stock.quantity}</td>
                          <td>{stock.product?.product_cost}</td>
                          <td>{stock.product?.product_price}</td>
                          <td>{(stock.quantity * (stock.product?.product_price || 0)).toFixed(2)}</td>
                          <td>{updatedValue.toFixed(2)}</td>
                          <td>{difference.toFixed(0)}</td>
                        </tr>
                      );
                    })}
                    <tr>
                      <td colSpan="3" className="text-end fw-bold">Total:</td>
                      <td className="fw-bold">{totalPhysicalStock}</td>
                      <td className="fw-bold">{totalSystemStock}</td>
                      <td className="fw-bold">-</td>
                      <td className="fw-bold">-</td>
                      <td className="fw-bold">{totalValue.toFixed(2)}</td>
                      <td className="fw-bold">{totalUpdatedValue.toFixed(2)}</td>
                      <td className="fw-bold">{(totalPhysicalStock - totalSystemStock).toFixed(0)}</td>
                    </tr>
                  </>
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center">No product stocks found</td>
                  </tr>
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </MasterLayout>
  );
};

export default ProductStockDetail;
