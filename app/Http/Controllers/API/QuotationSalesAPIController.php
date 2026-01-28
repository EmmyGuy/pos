<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Quotation;
use App\Models\QuotationPayment;
use App\Models\User;

class QuotationSalesAPIController extends Controller
{
        /**
     * Fetch Quotation Payments based on user role.
     * - Admin → fetch ALL quotation payments
     * - Shop Manager → fetch payments only for quotations belonging to their shop
     */
    public function index(Request $request)
    {
        $user = $request->user();
    
        // User roles
        $isAdmin = $user->hasRole('admin');
        $isShopManager = $user->hasRole('shop_manager');
    
        $query = QuotationPayment::with([
            'quotation.customer',
            'quotation.user',
        ]);
    
        if ($isShopManager) {
            // Restrict to quotations under the manager's shop
            $shopId = $user->shop_id;
    
            $query->whereHas('quotation', function ($q) use ($shopId) {
                $q->where('shop_id', $shopId);
            });
        }
    
        // Optional Filters
        if ($request->quotation_ref) {
            $ref = $request->quotation_ref;
    
            $query->whereHas('quotation', function ($q) use ($ref) {
                $q->where('reference_code', 'LIKE', "%$ref%");
            });
        }
    
        if ($request->start_date && $request->end_date) {
            $query->whereBetween('paid_at', [
                $request->start_date,
                $request->end_date
            ]);
        }
    
        $payments = $query->orderBy('paid_at', 'desc')->get();
    
        // Add calculated fields
        $payments->transform(function ($p) {
            $quotation = $p->quotation;
    
            $p->grand_total = $quotation->grand_total;
            $p->total_paid = $quotation->total_paid;
            $p->balance = $quotation->balance;
    
            $p->status =
                $p->balance <= 0 ? 'PAID' :
                ($p->total_paid > 0 ? 'PARTIALLY PAID' : 'UNPAID');
    
            return $p;
        });
    
        return response()->json([
            'success' => true,
            'payments' => $payments,
            'role' => $isAdmin ? 'admin' : 'shop_manager'
        ]);
    }


    /**
     * Search by sales_rep or quotation_ref.
     */
    public function search(Request $request)
    {
        $query = Quotation::query();

        if ($request->sales_rep_id) {
            $query->where('sales_rep_id', $request->sales_rep_id);
        }

        if ($request->quotation_ref) {
            $query->where('quotation_ref', 'LIKE', '%' . $request->quotation_ref . '%');
        }

        return response()->json($query->get());
    }

    /**
     * Filter by date range.
     */
    public function filterByDate(Request $request)
    {
        $request->validate([
            'start' => 'required|date',
            'end'   => 'required|date'
        ]);

        $data = Quotation::whereBetween('created_at', [
            $request->start . ' 00:00:00',
            $request->end   . ' 23:59:59'
        ])->get();

        return response()->json($data);
    }

    /**
     * Create a partial payment for a quotation.
     */
    public function createPayment(Request $request)
    {
        $request->validate([
            'quotation_ref' => 'required',
            'amount_paid'   => 'required|numeric|min:1'
        ]);

        $quotation = Quotation::where('quotation_ref', $request->quotation_ref)->first();

        if (!$quotation) {
            return response()->json(['error' => 'Quotation not found'], 404);
        }

        $payment = QuotationPayment::create([
            'quotation_id' => $quotation->id,
            'amount_paid'  => $request->amount_paid,
            'paid_by'      => $request->user()->id ?? null,
        ]);

        return response()->json([
            'message' => 'Payment recorded successfully',
            'payment' => $payment
        ]);
    }

    public function getSalesReps(Request $request)
    {
        $user = auth()->user();

        $query = User::query()->where('role', 'sales_rep');

        if ($user->role === 'shop_manager') {
            // shop manager sees only reps from same warehouse
            $query->where('warehouse_id', $user->warehouse_id);
        }

        // admin sees all sales reps — no filter needed

        return response()->json([
            'success' => true,
            'sales_reps' => $query->select('id', 'first_name', 'last_name', 'email', 'warehouse_id')->get(),
        ]);
    }
}
