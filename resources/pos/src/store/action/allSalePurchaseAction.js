import apiConfig from "../../config/apiConfig";
import { apiBaseURL, dashboardActionType, toastType } from "../../constants";
import { addToast } from "./toastAction";
import { setLoading } from "./loadingAction";
import { setTotalRecord } from "./totalRecordAction";

export const fetchAllSalePurchaseCount = (warehouseId) => async (dispatch) => {
    dispatch(setLoading(true));

    try {
        const response = await apiConfig.get(
            apiBaseURL.ALL_SALE_PURCHASE,
            {
                params: warehouseId
                    ? { warehouse_id: warehouseId }
                    : {}
            }
        );
        console.log("WAREHOUSE PARAM:", warehouseId);

        dispatch({
            type: dashboardActionType.FETCH_ALL_SALE_PURCHASE,
            payload: response.data.data,
        });
    } catch (error) {
        dispatch(
            addToast({
                text:
                    error?.response?.data?.message ||
                    "Failed to fetch sale & purchase count",
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch(setLoading(false));
    }
};


