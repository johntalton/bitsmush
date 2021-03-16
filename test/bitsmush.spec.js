/* eslint-disable semi */
/* eslint-disable fp/no-unused-expression */
/* eslint-disable no-magic-numbers */
import { describe, it } from 'mocha'
import { expect } from 'chai'

// eslint-disable-next-line sort-imports
import { BitSmush } from '@johntalton/bitsmush'

describe('BitSmush', () => {
  describe('#smushBits', () => {
    //
    it('should run README example', () => {
      const source = [1, 3, 2];
      const template = [ [6, 1], [5, 3], [1, 2] ];
      const expected = 0b0_1_011_0_10;
      const outRegister = BitSmush.smushBits(template, source);
      expect(outRegister).to.equal(expected);
    });

    it('should run README example second half', () => {
      const inRegister = 0x5A;
      const template = [ [6, 1], [5, 3], [1, 2] ];
      const [one, three, two] = BitSmush.unSmushBits(template, inRegister);
      expect(one).to.equal(1);
      expect(two).to.equal(2);
      expect(three).to.equal(3);
    });

    it('should throw error if template (type violation zero) @typeViolation', () => {
      const pm = [[]];
      expect(() => BitSmush.smushBits(pm, [])).to.throw('smush not exactly two items: offset / length');
    });

    it('should throw error if template (type violation gt 2) @typeViolation', () => {
      const pm = [[1, 2, 3]];
      expect(() => BitSmush.smushBits(pm, [])).to.throw('smush not exactly two items: offset / length');
    });

    it('should throw error if template (type violation offset) @typeViolation', () => {
      const pm = [['offset', 1]];
      expect(() => BitSmush.smushBits(pm, [])).to.throw('offset');
    });

    it('should throw error if template (type violation length) @typeViolation', () => {
      const pm = [[0, 'length']];
      expect(() => BitSmush.smushBits(pm, [])).to.throw('length');
    });

    it('should throw error if template (type violation type) @typeViolation', () => {
      const pm = [false];
      expect(() => BitSmush.smushBits(pm, [])).to.throw('smush is not an Array');
    });

    it.skip('should throw error if template (overlap) @broken', () => {
      expect(() => BitSmush.smushBits([[3, 2], [2, 3]], [])).to.throw('overlapping');
    });

    it.skip('should throw error if template (overlap ends) @broken', () => {
      expect(() => BitSmush.smushBits([[3, 2], [2, 2]], [])).to.throw('overlapping');
    });

    it('should truncate values to template lengths', () => {
      expect(BitSmush.smushBits([[1, 2]], [0b101])).to.equal(1);
    });

    it('should throw error (single number array) @slow', () => {
      expect(() => BitSmush.smushBits([3], [1])).to.throw('smush is not an Array');
    });

    it('should throw error (array of arrays of single number)', () => {
        expect(() => BitSmush.smushBits([[3]], [1])).to.throw('mush not exactly two items: offset / length')
    });

    it('should normalize pack example (already normal array of arrays of two numbers)', () => {
      expect(BitSmush.smushBits([[3, 1]], [1])).to.equal(8);
    });

    it('should pack multiple bits', () => {
      expect(BitSmush.smushBits([[3, 1], [7, 2]], [1, 3])).to.equal(0b11001000);
    });

    it('should pack multiple bits (extra)', () => {
      expect(BitSmush.smushBits([[3, 3], [7, 2]], [5, 3])).to.equal(0b11001010);
    });

    it('should pack multiple bits (first bit)', () => {
      expect(BitSmush.smushBits([[7, 1]], [1])).to.equal(0b10000000);
    });

    it('should pack multiple bits (last bit)', () => {
      expect(BitSmush.smushBits([[0, 1]], [1])).to.equal(0b00000001);
    });

    it('should pack multiple bits (last bit zero)', () => {
      expect(BitSmush.smushBits([[0, 1]], [0])).to.equal(0b00000000);
    });

    it('should pack multiple bits (support overlap)', () => {
      expect(BitSmush.smushBits([[3, 4], [0, 1]], [9, 0])).to.equal(0b00001000);
    });
  });

  describe('#unSmushBits', () => {
    it('should throw error (single number array)', () => {
      expect(() => BitSmush.unSmushBits([3], 0b1000)).to.throw('smush is not an Array')
    })

    it('should unpack multi byte handcrafted example', () => {
      const sourceData = 0b00_101_110
      expect(BitSmush.unSmushBits([[7, 2], [5, 3], [2, 3]], sourceData)).to.deep.equal([0, 5, 6])
    })
  })
})
