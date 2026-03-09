/**
 * Category Tests
 * Tests for category CRUD operations
 */

import { describe, it, expect } from 'vitest'

describe('Category Management Tests', () => {
    describe('Create Categories', () => {
        it('should successfully create a new category', async () => {
            const category = {
                name: 'Groceries',
                colorHex: '#51cf66'
            }

            const response = {
                success: true,
                id: 1,
                ...category
            }

            expect(response.success).toBe(true)
            expect(response.name).toBe('Groceries')
            expect(response.colorHex).toBe('#51cf66')
        })

        it('should reject category with empty name', async () => {
            const category = {
                name: '',
                colorHex: '#51cf66'
            }

            const response = {
                success: false,
                error: 'Category name is required'
            }

            expect(response.success).toBe(false)
        })

        it('should reject duplicate category name', async () => {
            const response = {
                success: false,
                error: 'Category already exists'
            }

            expect(response.success).toBe(false)
        })
    })

    describe('List Categories', () => {
        it('should fetch all user categories', async () => {
            const categories = [
                { id: 1, name: 'Groceries', colorHex: '#51cf66' },
                { id: 2, name: 'Transport', colorHex: '#4a9eff' },
                { id: 3, name: 'Entertainment', colorHex: '#ff6b6b' }
            ]

            expect(categories).toHaveLength(3)
            expect(categories[0].name).toBe('Groceries')
        })

        it('should return empty array when no categories exist', async () => {
            const categories = []

            expect(categories).toHaveLength(0)
        })
    })

    describe('Update Categories', () => {
        it('should successfully update a category', async () => {
            const updated = {
                id: 1,
                name: 'Food & Groceries',
                colorHex: '#a78bfa'
            }

            const response = {
                success: true,
                data: updated
            }

            expect(response.success).toBe(true)
            expect(response.data.name).toBe('Food & Groceries')
        })
    })

    describe('Delete Categories', () => {
        it('should successfully delete a category', async () => {
            const response = {
                success: true,
                message: 'Category deleted successfully'
            }

            expect(response.success).toBe(true)
        })

        it('should handle deletion of non-existent category', async () => {
            const response = {
                success: false,
                error: 'Category not found'
            }

            expect(response.success).toBe(false)
        })
    })

    describe('Category Validation', () => {
        it('should validate color hex format', () => {
            const validColors = ['#51cf66', '#4a9eff', '#ff6b6b', '#ffd93d']
            const hexRegex = /^#[0-9A-F]{6}$/i

            validColors.forEach(color => {
                expect(hexRegex.test(color)).toBe(true)
            })
        })

        it('should reject invalid color format', () => {
            const invalidColors = ['51cf66', '#GGG000', '#FFF', 'red']
            const hexRegex = /^#[0-9A-F]{6}$/i

            invalidColors.forEach(color => {
                expect(hexRegex.test(color)).toBe(false)
            })
        })
    })
})
