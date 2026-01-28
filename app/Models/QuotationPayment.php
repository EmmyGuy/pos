<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuotationPayment extends Model
{
    protected $fillable = [
        'quotation_id',
        'amount_paid',
        'payment_method',
        'reference',
        'received_by',
        'paid_at'
    ];

    public function quotation()
    {
        return $this->belongsTo(Quotation::class);
    }
}

