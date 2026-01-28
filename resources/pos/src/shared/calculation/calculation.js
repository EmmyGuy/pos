// export const subTotalCount = (cartItem) => {
//     const totalAmount = taxAmount(cartItem) + amountBeforeTax(cartItem);
//     return Number(+totalAmount * cartItem.quantity).toFixed(2);
// }

export const subTotalCount = (cartItem) => {
    const lineAmount = amountBeforeTax(cartItem) + taxAmount(cartItem);
    return Number(lineAmount * cartItem.quantity);
};



export const discountAmount = (cartItem) => {
    if (cartItem.discount_type === '1' || cartItem.discount_type === 1) {
        return ((+cartItem.fix_net_unit / 100) * +cartItem.discount_value);
    } else if (cartItem.discount_type === '2' || cartItem.discount_type === 2) {
        return +cartItem.discount_value;
    }
    return +cartItem.discount_amount.toFixed(2);
};

export const discountAmountMultiply = (cartItem) => {
    let discountMultiply = discountAmount(cartItem);
    return (+discountMultiply * cartItem.quantity).toFixed(2);
}

export const taxAmount = (cartItem) => {
    if (cartItem.tax_type === '2' || cartItem.tax_type === 2) {
        return ((+cartItem.fix_net_unit - discountAmount(cartItem)) * +cartItem.tax_value) / (100 + +cartItem.tax_value);
    } else if (cartItem.tax_type === '1' || cartItem.tax_type === 1) {
        return ((+cartItem.fix_net_unit - discountAmount(cartItem)) * +cartItem.tax_value) / 100;
    }

    return +cartItem.tax_amount.toFixed(2);
}

export const taxAmountMultiply = (cartItem) => {
    let taxMultiply = taxAmount(cartItem);
    return (+taxMultiply * cartItem.quantity).toFixed(2);
}

export const amountBeforeTax = (cartItem) => {
    let price = +cartItem.fix_net_unit;
    const unitCost = +price - discountAmount(cartItem);
    const inclusiveTax = +unitCost - taxAmount(cartItem);
    let finalCalPrice = cartItem.tax_type === '1' || cartItem.tax_type === 1 ? +unitCost : +inclusiveTax;
    return +finalCalPrice.toFixed(2);
}

export const amountBeforeTax1 = (cartItem) => {
    // Use the fixed net unit price directly (already discounted if your cart stores it)
    let price = +cartItem.fix_net_unit;

    // Apply tax logic only, do not remove discount
    const inclusiveTax = price - taxAmount(cartItem); // subtract tax if needed
    const finalCalPrice = cartItem.tax_type === '1' || cartItem.tax_type === 1 ? price : inclusiveTax;

    return +finalCalPrice.toFixed(2);
}

//Grand Total Calculation
// export const calculateCartTotalTaxAmount = (carts, inputValue) => { 
//     let taxValue = inputValue && inputValue.tax_rate;
//     let totalTax = 0;
//     let price = 0;

//     carts.forEach(cartItem => {
//         if (taxValue > 0) {
//             price = price + +cartItem.sub_total
//             totalTax = (((+price - inputValue.discount) / 100) * +taxValue) * +cartItem.quantity;
//         }
//     })

//     return (parseFloat(totalTax)).toFixed(2);
// }

export const calculateCartTotalTaxAmount = (carts, inputValue) => {
    const taxRate = Number(inputValue.tax_rate || 0);
    if (taxRate <= 0) return "0.00";

    const subTotal = calculateSubTotal(carts);
    const discount = Number(inputValue.discount || 0);

    const taxableAmount = subTotal - discount;
    const totalTax = (taxableAmount * taxRate) / 100;

    return totalTax.toFixed(2);
};


// export const calculateSubTotal = (carts) => {
//     let subTotalAmount = 0;
//     carts.forEach(cartItem => {
//         subTotalAmount = subTotalAmount + Number(subTotalCount(cartItem))
//     })
//     return +subTotalAmount;
// }

export const calculateSubTotal = (carts) => {
    return carts.reduce((acc, item) => acc + subTotalCount(item), 0);
};

// export const calculateCartTotalAmount = (carts, inputValue) => {
//     let finalTotalAmount
//     const value = inputValue && inputValue;
//     let totalAmountAfterDiscount = calculateSubTotal(carts) - value.discount
//     let taxCal = (totalAmountAfterDiscount * inputValue.tax_rate / 100).toFixed(2)
//     finalTotalAmount = Number(totalAmountAfterDiscount) + Number(taxCal) + Number(value.shipping)
//     return (parseFloat(finalTotalAmount).toFixed(2))
// }
export const calculateCartTotalAmount = (carts, inputValue) => {
    let subTotal = calculateSubTotal(carts);
    let discount = Number(inputValue.discount || 0);
    let taxRate = Number(inputValue.tax_rate || 0);
    let shipping = Number(inputValue.shipping || 0);

    let amountAfterDiscount = subTotal - discount;
    if (amountAfterDiscount < 0) amountAfterDiscount = 0;

    let taxAmount = (amountAfterDiscount * taxRate) / 100;

    return amountAfterDiscount + taxAmount + shipping;
};

/**
 * Calculate total discount from cart items
 * @param {Array} cartItems - array of products in cart
 * @returns {number} total discount
 */
export const calculateDiscount = (cartItems) => {
    if (!cartItems || !Array.isArray(cartItems)) return 0;

    return cartItems.reduce((total, item) => {
        // Assuming each item has `discount` and `quantity` fields
        const itemDiscount = (item.discount || 0) * (item.quantity || 1);
        return total + itemDiscount;
    }, 0);
};



