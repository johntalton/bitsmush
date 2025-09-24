# Bit Smush 🤗

Convenience methods when working with binary packed data.

[![npm Version](https://img.shields.io/npm/v/@johntalton/bitsmush.svg)](https://www.npmjs.com/package/@johntalton/bitsmush)
![GitHub package.json version](https://img.shields.io/github/package-json/v/johntalton/bitsmush)
[![CI](https://github.com/johntalton/bitsmush/actions/workflows/CI.yml/badge.svg)](https://github.com/johntalton/bitsmush/actions/workflows/CI.yml)

## Motivation

Primarily, this provides an abstraction from the mask/shift logic by specifying parameters in 'offset' and 'length' which, in some cases, can be simpler to reason about.

Secondly, it enforces the use of masking the final result to the length, something easily forgotten when simple shift logic is used.

Lastly, by hiding these operation in a single location, it removes binary operations from user code (which is sometimes enforced by linters and other clean code styles and best practices).

## The SmushMap

The methods `smushBits` and `unSmushBits` work given a template of the data offset and length.

This template (a `SmushMap`) consists of an array-of-arrays that contain two numbers - the offset and length.

- Offset is calculated from the right most bit, starting at zero
- Length is number of bits to copy into destination.

Offset index numbering:
| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|

### Example SmushMap
The following `SmushMap` `[[ 5, 2 ], [ 2, 2 ]]` with the source data `[3, 2]` when calling `smushBits` will produce `0b00_11_0_10_0`
| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 0  | 0  | `1` | `1` | 0 | `1` | `0` | 0  |

A bit-flags style `SmushMap` could be expressed as `[ [6, 1], [5, 1], [3, 1], [2, 1] ]`.
Using the source data of `[ENABLED, ENABLED, DISABLED, ENABLED]` (aka `[ 1, ,1 ,0, 1 ]`)
| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 0  | `1`  | `1` | 0 | `0` | `1` | 0 | 0 |

The following methods `smushBits` and `unSmushBits` work using these templates definitions.

## `smushBits` and `unSmushBits`

Packs or Unpacks multiple number values of specified length (in bits) into or out of a single 8-bit number given a `SmushMap` template.

```javascript
const template = [ [6, 1], [5, 3], [1, 2] ]
```

| 7 | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| 0  | `X`  | `Y` | `Y` | `Y` | 0 | `Z` | `Z` |

```javascript
const source = [1, 3, 2]
const expected = 0b0_1_011_0_10 // 0x5A
const outRegister = BitSmush.smushBits(template, source)
expect(outRegister).to.equal(expected)
```

And thus:

```javascript
const inRegister = 0x5A
const [ one, three, two ] = BitSmush.unSmushBits(template, inRegister)
expect(one).to.equal(1)
expect(two).to.equal(2)
expect(three).to.equal(3)
```

## `extractBits`

The extract bits method is internally used by `unSmushBits` to do the work of extracting over the entire `SmushMap`.

However, it is possible to use this method directly for more simplistic extraction cases

```javascript
const fromByte = 0b0001_1000
const result = BitSmush.extractBits(fromByte, 4, 2)
// result === 0b11
// equivalent to:
//  (fromByte >> 3) & 0b11
```