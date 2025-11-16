import { saleActionType } from '../../constants';

export default (state = [], action) => {
    switch (action.type) {
        case saleActionType.GET_SALES_BY_SHOP:
            return action.payload;
        default:
            return state;
    }
};
