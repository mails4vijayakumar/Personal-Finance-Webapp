# Excel Import Format Guide

## Supported File Types
- `.xlsx` (Excel 2007 and newer)
- `.xls` (Excel 97-2003)

## Column Format

Your Excel sheet should have **5 columns** in this order (Bank Statement Format):

| Column A | Column B | Column C | Column D | Column E |
|----------|----------|----------|----------|----------|
| Date | Narration | Chq./Ref.No | Withdrawal Amt. | Deposit Amt. |

## Example Data

| Date | Narration | Chq./Ref.No | Withdrawal Amt. | Deposit Amt. |
|---|---|---|---|---|
| 2026-03-01 | Monthly Salary | - | | 5000 |
| 2026-03-02 | Groceries | CHQ123 | 150.50 | |
| 2026-03-03 | Freelance Project | TRF456 | | 500 |
| 2026-03-04 | Gas Station | CHQ124 | 45.75 | |
| 2026-03-05 | Utilities | AUTO | 120 | |

## Column Specifications

### Column A: Date
- **Required:** Optional (if not provided, current date is used)
- **Type:** Date
- **Format:** Standard date formats (YYYY-MM-DD recommended)
- **Example:** "2026-03-01", "03/01/2026", "2026-03-01 10:30:00"

### Column B: Narration
- **Required:** Yes
- **Type:** Text
- **Max Length:** 255 characters
- **Description:** The description of the transaction
- **Example:** "Monthly Salary", "Groceries", "Gas", "Utility Bill"

### Column C: Chq./Ref.No
- **Required:** Optional
- **Type:** Text
- **Description:** Check number or reference number
- **Usage:** Appended to narration as "(Ref: CHQ123)"
- **Example:** "CHQ123", "TRF456", "AUTO", "-", ""

### Column D: Withdrawal Amt.
- **Required:** Optional (if Deposit is empty)
- **Type:** Decimal number
- **Valid Range:** > 0
- **Max Precision:** 2 decimal places
- **Type Detection:** Positive values = Expense transaction
- **Example:** 150.50, 45.75, 120

### Column E: Deposit Amt.
- **Required:** Optional (if Withdrawal is empty)
- **Type:** Decimal number
- **Valid Range:** > 0
- **Max Precision:** 2 decimal places
- **Type Detection:** Positive values = Income transaction
- **Example:** 5000, 500, 1200.50

## Import Logic

- **Withdrawal Amount > 0** → Transaction type = "expense"
- **Deposit Amount > 0** → Transaction type = "income"
- **Both empty or zero** → Row is skipped
- **Reference number included** → Appended to narration for reference

## Import Notes

1. **First row is treated as header** - The first row is automatically skipped. Your data should start from row 2.

2. **Invalid rows are skipped** - Any row with invalid data is silently skipped during import.

3. **Bulk import** - All valid rows are imported at once. You'll see a success message with the number of transactions imported.

4. **Automatic refresh** - After successful import, your transaction list updates automatically.

5. **Date optional** - If date is not provided or invalid, current date is used.

6. **Reference number is optional** - If provided, it's added to the transaction description.

## Example Excel Structure

```
Row 1: Date | Narration | Chq./Ref.No | Withdrawal Amt. | Deposit Amt. (Headers - will be skipped)
Row 2: 2026-03-01 | Monthly Salary | - | | 5000
Row 3: 2026-03-02 | Groceries | CHQ123 | 150.50 |
Row 4: 2026-03-03 | Freelance Project | TRF456 | | 500
Row 5: 2026-03-04 | Gas Station | CHQ124 | 45.75 |
Row 6: 2026-03-05 | Utilities | AUTO | 120 |
... and so on
```

## Common Issues

### "No valid transactions found in the file"
- Ensure data starts from row 2 (row 1 is headers)
- Check that Narration column has data
- Verify at least one of Withdrawal or Deposit amount is provided
- Check amounts are valid decimal numbers

### Invalid rows are skipped
- Narration must not be empty
- At least one amount column (Withdrawal or Deposit) must have a positive value
- Empty amount cells will be treated as 0
- Rows with no amounts will be skipped

### All amounts showing as expense/income
- If only Withdrawal column has values = all expenses
- If only Deposit column has values = all income
- Mix both columns for mixed transactions

## Template Download

You can create your own Excel file with the columns:
1. Date
2. Narration  
3. Chq./Ref.No
4. Withdrawal Amt.
5. Deposit Amt.

Then add your banking transaction data and upload via the app's "Import Transactions from Excel" section.

## Bank Statement Tips

This format matches typical bank statement exports:
- **Date** - Transaction date
- **Narration** - Description from bank statement
- **Chq./Ref.No** - Cheque number or transaction reference
- **Withdrawal** - Money going out (Expenses/Debits)
- **Deposit** - Money coming in (Income/Credits)
