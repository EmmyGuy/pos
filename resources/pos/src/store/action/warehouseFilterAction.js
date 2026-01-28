export const SET_SELECTED_WAREHOUSE = "SET_SELECTED_WAREHOUSE";

export const setSelectedWarehouse = (warehouseId) => ({
    type: SET_SELECTED_WAREHOUSE,
    payload: warehouseId,
});
