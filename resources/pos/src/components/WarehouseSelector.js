import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import ReactSelect from "../shared/select/reactSelect";
import { setSelectedWarehouse } from "../store/action/warehouseFilterAction";
// Import the fetch action (same one used in your CreateAdjustment example)
import { fetchAllWarehouses } from "../store/action/warehouseAction"; 
import { getFormattedMessage, placeholderText } from "../shared/sharedMethod";

const WarehouseSelector = () => {
    const dispatch = useDispatch();

    // Accessing warehouses and the selected ID from Redux
    const warehouses = useSelector(state => state.warehouses || []);
    const selectedWarehouseId = useSelector(
        state => state.warehouse?.selectedWarehouseId ?? null
    );

    // 1. Fetch data on mount, just like in CreateAdjustment
    useEffect(() => {
        dispatch(fetchAllWarehouses());
    }, [dispatch]);

    // 2. While data is loading, it stays null. 
    // Once fetchAllWarehouses updates Redux, this component re-renders and proceeds.
    if (!warehouses.length) {
        return null; 
    }

    const options = warehouses.map(w => ({
        value: w.id,
        label: w.attributes?.name || "",
    }));

    const selectedOption =
        selectedWarehouseId
            ? options.find(o => o.value === selectedWarehouseId)
            : null;

    return (
        <div className="warehouse-selector-container"> {/* Optional: Wrapper for styling */}
            <ReactSelect
                data={options}
                value={selectedOption}
                onChange={(selected) =>
                    dispatch(setSelectedWarehouse(selected?.value ?? null))
                }
                title={getFormattedMessage("warehouse.title")}
                placeholder={placeholderText(
                    "purchase.select.warehouse.placeholder.label"
                )}
            />
        </div>
    );
};

export default WarehouseSelector;