<?php

namespace App\Http\Requests;

use App\Models\Fund;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ExportFundTransactionsRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $fund = $this->route('fund');
        $allowedCategories = $fund instanceof Fund ? $this->availableCategories($fund) : [];

        return [
            'categories' => ['nullable', 'array'],
            'categories.*' => ['string', 'distinct', Rule::in($allowedCategories)],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function availableCategories(Fund $fund): array
    {
        return $fund->transactions()
            ->pluck('category')
            ->map(function ($category) {
                $value = trim((string) $category);

                return $value === '' ? 'Uncategorized' : $value;
            })
            ->unique()
            ->values()
            ->all();
    }
}
