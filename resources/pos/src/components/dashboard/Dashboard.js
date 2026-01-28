import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import MasterLayout from '../MasterLayout';
import TabTitle from '../../shared/tab-title/TabTitle';
import TodaySalePurchaseCount from './TodaySalePurchaseCount';
import RecentSale from './RecentSale';
import TopSellingProduct from './TopSellingProduct';
import { placeholderText } from '../../shared/sharedMethod';
import ThisWeekSalePurchaseChart from "./ThisWeekSalePurchaseChart";
import StockAlert from "./StockAlert";
import SalesByShop from "./SalesByShop";
import TopProgressBar from "../../shared/components/loaders/TopProgressBar";
import WarehouseSelector from '../WarehouseSelector';
// Import the fetch action to ensure data is loaded
import { fetchAllWarehouses } from '../../store/action/warehouseAction';

const Dashboard = () => {
    const dispatch = useDispatch();
    
    // 1. Grab everything from Redux state
    const { frontSetting } = useSelector(state => state);
    const selectedWarehouseId = useSelector(
        state => state.warehouse?.selectedWarehouseId ?? null
    );

    // 2. Fetch warehouses on mount so the selector isn't empty/hidden
    useEffect(() => {
        dispatch(fetchAllWarehouses());
    }, [dispatch]);

    return (
        <MasterLayout>
            <TopProgressBar />
            <TabTitle title={placeholderText('dashboard.title')} />

            {/* 3. We no longer need to pass props here because 
                WarehouseSelector handles its own Redux logic 
            */}
            <WarehouseSelector />

            <TodaySalePurchaseCount 
                frontSetting={frontSetting} 
                warehouseId={selectedWarehouseId} 
            />
            <ThisWeekSalePurchaseChart 
                frontSetting={frontSetting} 
                warehouseId={selectedWarehouseId} 
            />
            <TopSellingProduct 
                frontSetting={frontSetting} 
                warehouseId={selectedWarehouseId} 
            />
            <RecentSale 
                frontSetting={frontSetting} 
                warehouseId={selectedWarehouseId} 
            />
            <StockAlert 
                frontSetting={frontSetting} 
                warehouseId={selectedWarehouseId} 
            />
            <SalesByShop 
                frontSetting={frontSetting} 
                warehouseId={selectedWarehouseId} 
            />
        </MasterLayout>
    );
};

export default Dashboard;