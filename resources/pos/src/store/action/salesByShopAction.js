import apiConfig from '../../config/apiConfig';
import { apiBaseURL, toastType, saleActionType } from '../../constants';
import { addToast } from './toastAction';
import { setLoading } from './loadingAction';

export const salesByShopAction = () => async (dispatch) => {
    dispatch(setLoading(true));

    await apiConfig
        .get(apiBaseURL.SALES_BY_SHOPS)
        .then((response) => {
            dispatch({
                type: saleActionType.GET_SALES_BY_SHOP,
                payload: response.data.data, // make sure your Laravel returns this as a clean array
            });
            dispatch(setLoading(false));
        })
        .catch(({ response }) => {
            dispatch(setLoading(false));
            dispatch(
                addToast({
                    text: response?.data?.message || 'Failed to fetch sales by shop',
                    type: toastType.ERROR,
                })
            );
        });
};
