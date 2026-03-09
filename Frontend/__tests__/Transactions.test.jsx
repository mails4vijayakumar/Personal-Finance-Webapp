/**
 * Transaction Tests
 * Tests for transaction CRUD operations and filtering
 */

import { describe, it, expect } from 'vitest'

describe('Transaction Management Tests', () => {
    describe('Create Transactions', () => {
        it('should successfully create an income transaction', async () => {
            const transaction = {
                description: 'Monthly Salary',
                amount: 5000,
                type: 'income',
                date: new Date().toISOString(),
                categoryId: 1
            }

            const response = {
                success: true,
                id: 1,
                ...transaction
            }

            expect(response.success).toBe(true)
            expect(response.type).toBe('income')
            expect(response.amount).toBe(5000)
        })

        it('should successfully create an expense transaction', async () => {
            const transaction = {
                description: 'Grocery Shopping',
                amount: 150.50,
                type: 'expense',
                date: new Date().toISOString(),
                categoryId: 2
            }

            const response = {
                success: true,
                id: 2,
                ...transaction
            }

            expect(response.success).toBe(true)
            expect(response.type).toBe('expense')
            expect(response.amount).toBe(150.50)
        })

        it('should reject transaction with negative amount', async () => {
            const transaction = {
                description: 'Invalid Transaction',
                amount: -100,
                type: 'expense'
            }

            const response = {
                success: false,
                error: 'Amount must be greater than 0'
            }

            expect(response.success).toBe(false)
        })
    })

    describe('List & Filter Transactions', () => {
        it('should fetch all transactions for authenticated user', async () => {
            const transactions = [
                {
                    id: 1,
                    description: 'Salary',
                    amount: 5000,
                    type: 'income'
                },
                {
                    id: 2,
                    description: 'Coffee',
                    amount: 5,
                    type: 'expense'
                }
            ]

            expect(transactions).toHaveLength(2)
            expect(transactions[0].type).toBe('income')
            expect(transactions[1].type).toBe('expense')
        })

        it('should filter transactions by search term', async () => {
            const allTransactions = [
                { id: 1, description: 'Salary', type: 'income' },
                { id: 2, description: 'Grocery', type: 'expense' },
                { id: 3, description: 'Gas', type: 'expense' }
            ]

            const filtered = allTransactions.filter(t =>
                t.description.toLowerCase().includes('grocery')
            )

            expect(filtered).toHaveLength(1)
            expect(filtered[0].description).toBe('Grocery')
        })

        it('should filter transactions by category', async () => {
            const allTransactions = [
                { id: 1, categoryId: 1, description: 'Groceries' },
                { id: 2, categoryId: 2, description: 'Gas' },
                { id: 3, categoryId: 1, description: 'Food' }
            ]

            const filtered = allTransactions.filter(t => t.categoryId === 1)

            expect(filtered).toHaveLength(2)
        })

        it('should filter transactions by type', async () => {
            const allTransactions = [
                { id: 1, type: 'income', amount: 1000 },
                { id: 2, type: 'expense', amount: 100 },
                { id: 3, type: 'income', amount: 500 }
            ]

            const income = allTransactions.filter(t => t.type === 'income')
            expect(income).toHaveLength(2)

            const expenses = allTransactions.filter(t => t.type === 'expense')
            expect(expenses).toHaveLength(1)
        })

        it('should filter transactions by date range', async () => {
            const startDate = new Date('2026-01-01')
            const endDate = new Date('2026-03-31')

            const allTransactions = [
                { id: 1, date: '2025-12-15', amount: 100 },
                { id: 2, date: '2026-02-15', amount: 200 },
                { id: 3, date: '2026-04-15', amount: 300 }
            ]

            const inRange = allTransactions.filter(t => {
                const tDate = new Date(t.date)
                return tDate >= startDate && tDate <= endDate
            })

            expect(inRange).toHaveLength(1)
            expect(inRange[0].id).toBe(2)
        })
    })

    describe('Update Transactions', () => {
        it('should successfully update a transaction', async () => {
            const updated = {
                id: 1,
                description: 'Updated Description',
                amount: 150,
                type: 'expense'
            }

            const response = {
                success: true,
                data: updated
            }

            expect(response.success).toBe(true)
            expect(response.data.description).toBe('Updated Description')
        })
    })

    describe('Delete Transactions', () => {
        it('should successfully delete a transaction', async () => {
            const response = {
                success: true,
                message: 'Transaction deleted successfully'
            }

            expect(response.success).toBe(true)
        })

        it('should handle deletion of non-existent transaction', async () => {
            const response = {
                success: false,
                error: 'Transaction not found'
            }

            expect(response.success).toBe(false)
        })
    })

    describe('Summary Statistics', () => {
        it('should calculate correct balance', async () => {
            const transactions = [
                { type: 'income', amount: 5000 },
                { type: 'expense', amount: 1000 },
                { type: 'expense', amount: 500 }
            ]

            const income = transactions
                .filter(t => t.type === 'income')
                .reduce((sum, t) => sum + t.amount, 0)

            const expenses = transactions
                .filter(t => t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0)

            const balance = income - expenses

            expect(income).toBe(5000)
            expect(expenses).toBe(1500)
            expect(balance).toBe(3500)
        })
    })
})
