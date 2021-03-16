// pack map and its reverse
export const SMUSH_MAP_8_BIT_NAMES = [7, 6, 5, 4, 3, 2, 1, 0]

export type SmushOffsetLength = [number, number]
export type SmushMap = Array<SmushOffsetLength>

const ZERO = 0
const ONE = 1
const TWO = 2
/**
 *
 **/
export class BitSmush {
  private static assertNonOverlapping(_smushMap: SmushMap) {
  }

  private static assertOrdered(_smushMap: SmushMap) {
  }

  private static assertSmushMap(smushMap: SmushMap) {

    if(!Array.isArray(smushMap)) { throw new Error('smushMap is not an Array') }

    smushMap.forEach(smush => {
      if(!Array.isArray(smush)) { throw new Error('smush is not an Array') }
      if(smush.length !== 2) { throw new Error('smush not exactly two items: offset / length') }

      const [ offset, length ] = smush
      if(!Number.isInteger(offset)) { throw new Error('smush offset is not a number') }
      if(!Number.isInteger(length)) { throw new Error('smush length is not a number') }
      if(!SMUSH_MAP_8_BIT_NAMES.includes(offset)) { throw new Error('smush offset not valid') }
      if(length > SMUSH_MAP_8_BIT_NAMES.length) { throw new Error('smush length exceeds max') }
      if(length <= ZERO) { throw new Error('smush length must be greater then zero') }

      const shift = offset - length + ONE
      if(shift < ZERO) { throw new Error('smush shift less then zero') }
    })

    BitSmush.assertOrdered(smushMap)
    BitSmush.assertNonOverlapping(smushMap)
  }

  static smushBits(smushMap: SmushMap, sourceData: Array<number>): number {
    BitSmush.assertSmushMap(smushMap)
    return smushMap
      .reduce((accum, [position, length], idx) => {
        const mask = BitSmush.mask(length)
        const value = sourceData[idx]
        const shift = position + ONE - length
        return (accum & ~(mask << shift)) | ((value  & mask) << shift)
      }, ZERO)
  }

  static unSmushBits(smushMap: SmushMap, bits: number): Array<number> {
    BitSmush.assertSmushMap(smushMap)
    return smushMap.map(([position, length]) => BitSmush.extractBits(bits, position, length))
  }

  static extractBits(bits: number, position: number, length: number): number {
    const shift = position - length + ONE
    const mask = BitSmush.mask(length)
    return (bits >> shift) & mask
  }

  static mask(length: number) {
    return Math.pow(TWO, length) - ONE
  }
}