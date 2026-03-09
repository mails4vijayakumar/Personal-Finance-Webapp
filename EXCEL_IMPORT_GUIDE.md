# Excel Import Format Guide

## Supported File Types
- `.xlsx` (Excel 2007 and newer)
- `.xls` (Excel 97-2003)

## Column Format

Your Excel sheet should have **4 columns** in this order:

| Column A | Column B | Column C | Column D |
|----------|----------|----------|----------|
| Description | Amount | Type | Date |

## Example Data

| Description | Amount | Type | Date |
|---|---|---|---|
| Monthly Salary | 5000 | income | 2026-03-01 |
| Groceries | 150.50 | expense | 2026-03-02 |
| Freelance Project | 500 | income | 2026-03-03 |
| Gas | 45.75 | expense | 2026-03-04 |
| Utilities | 120 | expense | 2026-03-05 |

## Column Specifications

### Column A: Description
- **Required:** Yes
- **Type:** Text
- **Max Length:** 255 characters
- **Example:** "Monthly Salary", "Groceries", "Gas", etc.

### Column B: Amount
- **Required:** Yes
- **Type:** Decimal number
- **Valid Range:** > 0
- **Max Precision:** 2 decimal places
- **Example:** 5000, 150.50, 45.75

### Column C: Type
- **Required:** Yes
- **Type:** Text
- **Valid Values:** "income" or "expense" (case-insensitive)
- **Example:** "income", "expense", "Income", "EXPENSE"

### Column D: Date
- **Required:** Optional
- **Type:** Date (if not provided, current date is used)
- **Format:** Standard date formats (YYYY-MM-DD recommended)
- **Examples:** "2026-03-01", "03/01/2026", "2026-03-01 10:30:00"

## Import Notes

1. **First row is treated as header** - The first row is automatically skipped. Your data should start from row 2.

2. **Invalid rows are skipped** - Any row with invalid data is silently skipped during import.

3. **Bulk import** - All valid rows are imported at once. You'll see a success message with the number of transactions imported.

4. **Automatic refresh** - After successful import, your transaction list updates automatically.

5. **Case-insensitive type** - Both "income" and "INCOME" work fine.

## Example Excel Structure

```
Row 1: Description | Amount | Type | Date (Headers - will be skipped)
Row 2: Monthly Salary | 5000 | income | 2026-03-01
Row 3: Groceries | 150.50 | expense | 2026-03-02
Row 4: Freelance Project | 500 | income | 2026-03-03
Row 5: Gas | 45.75 | expense | 2026-03-04
... and so on
```

## Common Issues

### "No valid transactions found in the file"
- Ensure data starts from row 2 (row 1 is headers)
- Check that all required columns have data
- Verify Amount is a valid decimal number
- Verify Type is either "income" or "expense"

### Invalid amounts are skipped
- Amount must be a positive number
- Amount must have at most 2 decimal places
- Empty amount cells will skip that row

### Invalid dates are skipped or use current date
- If date is not provided or invalid, current date is used
- Dates should be in standard format (YYYY-MM-DD)

## Template Download

You can create your own Excel file with the columns:
1. Description
2. Amount  
3. Type
4. Date

Then add your transaction data and upload via the app's "Import Transactions from Excel" section.
