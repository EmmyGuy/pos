import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // React Router v6+
import { Card, Row, Table } from "react-bootstrap";
import { connect } from "react-redux";
import { getFormattedMessage, currencySymbolHandling } from "../../shared/sharedMethod";
import { salesByShopAction } from "../../store/action/salesByShopAction";

const SalesByShop = ({ salesByShop, salesByShopAction, allConfigData, frontSetting, config }) => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // Fetch the sales by shop data when the component mounts
        salesByShopAction();
    }, []);

    // onClick function to check permission and navigate
    const onClick = (shopName, permission) => {
        if (config && config.includes(permission)) {
            navigate(`/app/sales-by-shop/${shopName}`);
            // navigate('/app/sales');
        } else {
            console.log("Permission check failed or config is missing");
        }
    };

    return (
        <div className="pt-6">
            <Row className="g-4">
                <div className="col-xxl-12 col-12">
                    <Card>
                        <Card.Header className="pb-0 px-10">
                            <h5 className="mb-0">
                                {getFormattedMessage("dashboard.salesByShop.title")}
                            </h5>
                        </Card.Header>
                        <Card.Body className="pt-7 pb-2">
                            <Table responsive>
                                <thead>
                                    <tr>
                                        <th>{getFormattedMessage("dashboard.shop.label")}</th>
                                        <th>{getFormattedMessage("dashboard.salesByShop.totalSale.label")}</th>
                                        <th>{getFormattedMessage("dashboard.salesByShop.totalReturn.label")}</th>
                                        <th>{getFormattedMessage("dashboard.salesByShop.netSale.label")}</th>
                                        <th>{getFormattedMessage("dashboard.salesByShop.totalCost.label")}</th>
                                        <th>{getFormattedMessage("dashboard.salesByShop.profit.label")}</th>
                                        <th>Today's Sale</th>
                                        <th>This Month Sale</th>
                                        <th>{getFormattedMessage("react-data-table.action.column.label")}</th>
                                    </tr>
                                </thead>
                                <tbody className="text-nowrap">
                                    {salesByShop && salesByShop.map((shop, index) => (
                                        <tr key={index}>
                                            <td className="py-4">{shop.shop_name}</td>
                                            <td className="py-4">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    shop.total_sale
                                                )}
                                            </td>
                                            <td className="py-4">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    shop.total_return
                                                )}
                                            </td>
                                            <td className="py-4">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    shop.net_sale
                                                )}
                                            </td>
                                            <td className="py-4">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    shop.total_cost
                                                )}
                                            </td>
                                            <td className="py-4">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    shop.profit
                                                )}
                                            </td>
                                            <td className="py-4">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    shop.today_sale
                                                )}
                                            </td>

                                            <td className="py-4">
                                                {currencySymbolHandling(
                                                    allConfigData,
                                                    frontSetting?.value?.currency_symbol,
                                                    shop.this_month_sale
                                                )}
                                            </td>
                                            <td className="py-4">
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => onClick(shop.shop_name, "manage_sale")}
                                                >
                                                    {getFormattedMessage("react-data-table.view.button.label")}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </div>
            </Row>
        </div>
    );
};

const mapStateToProps = (state) => {
    const { salesByShop, allConfigData, frontSetting, config } = state; // Access salesByShop from Redux store
    return { salesByShop, allConfigData, frontSetting, config };
};

export default connect(mapStateToProps, { salesByShopAction })(SalesByShop);
