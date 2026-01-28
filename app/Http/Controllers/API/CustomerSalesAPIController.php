<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Customer;
use App\Models\Quotation;
use App\Models\CustomerPayment;
use App\Models\User;
use Spatie\Permission\Models\Role;

class CustomerSalesAPIController extends Controller
{
    /**
     * Fetch customer transactions (quotations + payments) based on user role.
     * Admin → all customers
     * Shop Manager → only customers in their warehouse
     */
    public function getCustomerTransactions(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer'
        ]);

        $user = $request->user();
        $customerId = $request->customer_id;

        $customer = Customer::find($customerId);
        if (!$customer) {
            return response()->json([
                'success' => false,
                'message' => 'Customer not found.'
            ], 404);
        }

        // Restrict shop managers
        if ($user->hasRole('shop_manager') && $customer->warehouse_id !== $user->warehouse_id) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized: Customer not in your warehouse.'
            ], 403);
        }

        // Load quotations
        $quotations = Quotation::with(['user'])
            ->where('customer_id', $customerId)
            ->orderBy('created_at', 'desc')
            ->get();

        // Load payments
        $payments = CustomerPayment::with(['user'])
            ->where('customer_id', $customerId)
            ->orderBy('paid_at', 'desc')
            ->get();

        // Compute totals
        $quotationTotal = $quotations->sum('grand_total');
        $paymentTotal   = $payments->sum('amount_paid');
        $balance        = $quotationTotal - $paymentTotal;

        return response()->json([
            'success' => true,
            'customer' => $customer,
            'quotations' => $quotations,
            'payments' => $payments,
            'summary' => [
                'quotation_total' => $quotationTotal,
                'payment_total' => $paymentTotal,
                'balance' => $balance,
            ]
        ]);
    }

    /**
     * Create a new customer payment
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer',
            'amount_paid' => 'required|numeric|min:1',
            'payment_method' => 'nullable|string',
            'reference' => 'nullable|string'
        ]);

        $customer = Customer::find($request->customer_id);
        if (!$customer) {
            return response()->json(['error' => 'Customer not found'], 404);
        }

        // Optional: check role restrictions
        $user = $request->user();
        if ($user->hasRole('shop_manager') && $customer->warehouse_id !== $user->warehouse_id) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $payment = CustomerPayment::create([
            'customer_id' => $customer->id,
            'amount_paid' => $request->amount_paid,
            'payment_method' => $request->payment_method ?? 'cash',
            'reference' => $request->reference ?? null,
            'paid_at' => now(),
            'paid_by' => $user->id,
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Payment recorded successfully',
            'payment' => $payment
        ]);
    }

    /**
     * Search customer quotations by reference
     */
    public function searchQuotations(Request $request)
    {
        $request->validate([
            'customer_id' => 'required|integer',
            'search_ref' => 'nullable|string'
        ]);

        $customerId = $request->customer_id;
        $searchRef = $request->search_ref ?? '';

        $user = $request->user();

        $query = Quotation::with(['user'])
            ->where('customer_id', $customerId);

        // Shop manager restriction
        if ($user->hasRole('shop_manager')) {
            $query->whereHas('customer', function($q) use ($user) {
                $q->where('warehouse_id', $user->warehouse_id);
            });
        }

        if ($searchRef) {
            $query->where('reference_code', 'LIKE', "%$searchRef%");
        }

        $quotations = $query->orderBy('created_at', 'desc')->get();

        return response()->json([
            'success' => true,
            'quotations' => $quotations
        ]);
    }

    /**
     * Fetch sales reps
     */
    public function getSalesReps(Request $request)
    {
        $user = $request->user();

        $salesRepRole = Role::where('name', 'sales rep')->first();
        if (!$salesRepRole) {
            return response()->json([
                'success' => false,
                'sales_reps' => [],
                'message' => 'sales_rep role not found'
            ]);
        }

        $query = User::whereHas('roles', function ($q) use ($salesRepRole) {
            $q->where('role_id', $salesRepRole->id);
        });

        if ($user->hasRole('shop_manager')) {
            $query->where('warehouse_id', $user->warehouse_id);
        }

        $salesReps = $query->select('id', 'first_name', 'last_name', 'email', 'warehouse_id')->get();

        return response()->json([
            'success' => true,
            'sales_reps' => $salesReps
        ]);
    }
}
