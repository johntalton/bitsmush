// // @ts-check

import { describe, it } from 'node:test'
import Assert from 'node:assert/strict'

import { BitSmush } from '@johntalton/bitsmush'

describe('BitSmush', () => {
	describe('assertSmushMap', () => {
		it('should handle empty', () => {
			BitSmush.unSmushBits([], 0)
		})

		it('should handle non array', () => {
			Assert.throws(() => BitSmush.unSmushBits(42, 0), {
				message: 'smushMap is not an Array',
				name: 'Error'
			})
		})

		it('should handle item not array', () => {
			Assert.throws(() => BitSmush.unSmushBits([ 42 ], 0), {
				message: 'smush is not an Array',
				name: 'Error'
			})
		})

		it('should handle item not array or two items', () => {
			Assert.throws(() => BitSmush.unSmushBits([ [ 7 ] ], 0), {
				message: 'smush not exactly two items: offset / length',
				name: 'Error'
			})
		})

		it('should handle item offset not integers', () => {
			Assert.throws(() => BitSmush.unSmushBits([ [ '7', 1 ] ], 0), {
				message: 'smush offset is not a number',
				name: 'Error'
			})
		})

		it('should handle item length not integers', () => {
			Assert.throws(() => BitSmush.unSmushBits([ [ 7, '1' ] ], 0), {
				message: 'smush length is not a number',
				name: 'Error'
			})
		})

		it('should handle item length negative', () => {
			Assert.throws(() => BitSmush.unSmushBits([ [ 7, -42 ] ], 0), {
				message: 'smush length must be greater then zero',
				name: 'Error'
			})
		})

		it('should handle shift length negative', () => {
			Assert.throws(() => BitSmush.unSmushBits([ [ 2, 4 ] ], 0), {
				message: 'smush shift less then zero',
				name: 'Error'
			})
		})
	})

	describe('smushBits', () => {
		it('should handle empty map', () => {
			const result = BitSmush.smushBits([], [])
			Assert.equal(result, 0)
		})

		it('should handle basic', () => {
			const result = BitSmush.smushBits([ [ 6,3 ], [ 2,1 ] ], [ 0b101, 0b1 ])
			Assert.equal(result, 0b0101_0100)
		})

		it('should handle overlap write to zero', () => {
			const result = BitSmush.smushBits([ [ 6,3 ], [ 4,1 ] ], [ 0b101, 0b0 ])
			Assert.equal(result, 0b0100_0000)
		})

		it('should handle empty undefined values', () => {
			Assert.throws(() => BitSmush.smushBits([ [ 1,1 ]], [ undefined ]), {
				message: 'source contains undefined values',
				name: 'Error'
			})
		})
	})

	describe('unSmushBits', () => {
		it('should handle basics', () => {
			const result = BitSmush.unSmushBits([ [ 7,3 ], [ 3,2 ] ], 0b1010_1100)
			Assert.deepEqual(result, [ 0b101, 0b11 ])
		})

		it('should handle empty map', () => {
			const result = BitSmush.unSmushBits([  ], 0)
			Assert.deepEqual(result, [  ])
		})

		it('should handle 8bit value', () => {
			const result = BitSmush.unSmushBits([ [ 7,8 ] ], 0b1010_1100)
			Assert.deepEqual(result, [ 0b1010_1100 ])
		})

		it('should handle overlap', () => {
			const result = BitSmush.unSmushBits([ [ 4,2 ], [ 3,1 ] ], 0b1010_1100)
			Assert.deepEqual(result, [ 0b01, 0b1 ])
		})

		it('should handle non-readonly results (ts-check only)', () => {
			const sm = /** @type {const} */ ([ [ 3,2 ] ])
			const result = BitSmush.unSmushBits(sm, 0b0000_1100)
			Assert.deepEqual(result, /** @type {const} */([ 0b11 ]))
			result[0] = 42
			result.push(77)
			Assert.deepEqual(result, [ 42, 77 ])
		})
	})

	describe('extractBits', () => {
		it('should extract unique bits (8-bit)', () => {
			const result = BitSmush.extractBits(0b1111_0100, 4, 3)
			Assert.equal(result, 0b101)
		})

		it('should handle length out of bounds', () => {
			Assert.throws(() => BitSmush.extractBits(0b0000_0111, 2, 4), {
				message: 'negative shift unsupported',
				name: 'RangeError'
			})

		})

		it('should extract unique bits (16-bit)', () => {
			const result = BitSmush.extractBits(0b1010_1000_1111_0100, 15, 4)
			Assert.equal(result, 0b1010)
		})
	})

	describe('mask', () => {
		it('should handle -1-bit mask', () => {
			Assert.throws(() => BitSmush.mask(-1), {
				message: 'negative mask not allowed',
				name: 'RangeError'
			})
		})

		it('should handle 0-bit mask', () => {
			const result = BitSmush.mask(0)
			Assert.equal(result, 0b0)
		})

		it('should handle 3-bit mask', () => {
			const result = BitSmush.mask(3)
			Assert.equal(result, 0b111)
		})

		it('should handle 8-bit mask', () => {
			const result = BitSmush.mask(8)
			Assert.equal(result, 0b1111_1111)
		})

		it('should handle 9-bit mask', () => {
			const result = BitSmush.mask(9)
			Assert.equal(result, 0b0001_1111_1111)
		})
	})
})

