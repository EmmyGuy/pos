// import apiConfig from '../../config/apiConfig';
// import {apiBaseURL, toastType, todaySalePurchaseCountActionType} from '../../constants';
// import {addToast} from './toastAction';
// import {setLoading} from "./loadingAction";

// export const todaySalePurchaseCount = () => async (dispatch) => {
//     dispatch(setLoading(true));
//     apiConfig.get(apiBaseURL.TODAY_SALE_COUNT)
//         .then((response) => {
//             dispatch({type: todaySalePurchaseCountActionType.TODAY_SALE_COUNT, payload: response.data.data})
//             dispatch(setLoading(false));
//         })
//         .catch(({response}) => {
//             dispatch(addToast(
//                 {text: response.data.message, type: toastType.ERROR}));
//             dispatch(setLoading(false));
//         });
// }

import apiConfig from '../../config/apiConfig';
import {
    apiBaseURL,
    toastType,
    todaySalePurchaseCountActionType
} from '../../constants';
import { addToast } from './toastAction';
import { setLoading } from './loadingAction';

export const todaySalePurchaseCount = (warehouseId) => async (dispatch) => {
    dispatch(setLoading(true));

    try {
        const response = await apiConfig.get(
                apiBaseURL.TODAY_SALE_COUNT,
                {
                    params: warehouseId
                        ? { warehouse_id: warehouseId }
                        : {}
                }
            );

            //console.log("WAREHOUSE PARAM:", warehouseId);

            dispatch({
                type: DASHBOARD_TODAY_SALE_PURCHASE_COUNT,
                payload: response.data.data
            }); 
    } catch (error) {
        console.log(error.response);
        const message =
            error?.response?.data?.message ||
            'Failed to fetch today sale purchase count';

        dispatch(
            addToast({
                text: message,
                type: toastType.ERROR,
            })
        );
    } finally {
        dispatch(setLoading(false));
    }
};
