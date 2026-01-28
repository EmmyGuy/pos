import React, { useMemo } from "react";
import {
    calculateCartTotalAmount,
    calculateSubTotal,
    calculateDiscount, // Make sure this exists in your calculation file
} from "../../shared/calculation/calculation";
import {
    currencySymbolHandling,
    getFormattedMessage,
} from "../../shared/sharedMethod";

const ProductMainCalculation = ({
    inputValues,
    updateProducts,
    frontSetting,
    allConfigData,
}) => {
    // Dynamically calculate discount from cart
    const totalDiscount = useMemo(() => calculateDiscount(updateProducts), [updateProducts]);

    // Subtotal minus discount
    const totalAmountAfterDiscount = useMemo(
        () => calculateSubTotal(updateProducts) - totalDiscount,
        [updateProducts, totalDiscount]
    );

    // Tax calculation
    const taxCal = useMemo(
        () => ((totalAmountAfterDiscount * (inputValues.tax_rate || 0)) / 100).toFixed(2),
        [totalAmountAfterDiscount, inputValues.tax_rate]
    );

    return (
        <div className="col-xxl-5 col-lg-6 col-md-6 col-12 float-end">
            <div className="card">
                <div className="card-body pt-7 pb-2">
                    <div className="table-responsive">
                        <table className="table border">
                            <tbody>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage("purchase.input.order-tax.label")}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting?.value?.currency_symbol,
                                            taxCal
                                        )}{" "}
                                        ({parseFloat(inputValues.tax_rate || 0).toFixed(2)} %)
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage("purchase.order-item.table.discount.column.label")}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting?.value?.currency_symbol,
                                            totalDiscount
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3">
                                        {getFormattedMessage("purchase.input.shipping.label")}
                                    </td>
                                    <td className="py-3">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting?.value?.currency_symbol,
                                            inputValues.shipping || 0
                                        )}
                                    </td>
                                </tr>
                                <tr>
                                    <td className="py-3 text-primary">
                                        {getFormattedMessage("purchase.grant-total.label")}
                                    </td>
                                    <td className="py-3 text-primary">
                                        {currencySymbolHandling(
                                            allConfigData,
                                            frontSetting?.value?.currency_symbol,
                                            calculateCartTotalAmount(updateProducts, {
                                                ...inputValues,
                                                discount: totalDiscount,
                                            })
                                        )}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductMainCalculation;
