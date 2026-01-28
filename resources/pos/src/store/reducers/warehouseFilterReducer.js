import { SET_SELECTED_WAREHOUSE } from "../action/warehouseFilterAction";

const initialState = {
    warehouses: [],
    selectedWarehouseId: null, // null = All Warehouses
};

export default function warehouseFilterReducer(state = initialState, action) {
    switch (action.type) {
        case SET_SELECTED_WAREHOUSE:
            return {
                ...state,
                selectedWarehouseId: action.payload,
            };
        default:
            return state;
    }
}
