import Foswig from 'foswig'
import { words } from "./words_en"
import { KeyData } from "./statistics"


export class Context {
  private readonly _data = new Map<string, KeyData>()

  public set(key: string) {
    this._data.set(key, new KeyData(key))
  }

  public get(key: string): KeyData | undefined {
    return this._data.get(key)
  }

  public getActive(): KeyData[] {
    return [...this._data.values()].filter(d => d.active)
  }
}

export interface IWordGenerator {
  getWeight(context: Context): number
  generate(context: Context): string
}

export class CharPairGenerator implements IWordGenerator {
  private keys(context: Context): KeyData[] {
    return context.getActive()
  }

  getWeight(context: Context): number {
    return this.keys(context).length <= 5 ? 1 : 0
  }

  generate(context: Context): string {
    let result = ""
    const wordLength = Math.random() * 6
    const allowedKeys = this.keys(context)

    for (let i = 0; i <= wordLength; i++) {
      const random = Math.random()
      const index = Math.floor(random * allowedKeys.length)
      result += allowedKeys[index].key
    }
    return result
  }
}

export class TrobledKeyGenerator implements IWordGenerator {
  private keys(context: Context): KeyData[] {
    return context.getActive().filter(x => x.focus === true)
  }

  getWeight(context: Context): number {
    return this.keys(context).length
  }

  generate(context: Context): string {
    let result = ""
    const wordLength = Math.random() * 6
    const allowedKeys = this.keys(context)

    for (let i = 0; i <= wordLength; i++) {
      const random = Math.random()
      const index = Math.floor(random * allowedKeys.length)
      result += allowedKeys[index].key
    }
    return result
  }
}

export class WordWithTroubledCharGenerator implements IWordGenerator {
  private keys(context: Context): KeyData[] {
    return context.getActive().filter(x => x.focus)
  }

  private wordContainsOnlyAllowedChars(word: string, allowedChars: string[]): boolean {
    return word.split('').filter(c => allowedChars.indexOf(c) < 0).length === 0
  }

  private wordContainsAnyAllowedChars(word: string, allowedChars: string[]): boolean {
    return word.split('').filter(c => allowedChars.indexOf(c) >= 0).length > 0
  }

  getWeight(context: Context): number {
    if (context.getActive().length <= 5) { return 0 }
    return this.keys(context).length * 2
  }

  generate(context: Context): string {
    const allowedChars = context.getActive().map(x => x.key)
    const focusedChars = this.keys(context).map(x => x.key)
    const filteredWords = words.filter(w =>
      this.wordContainsOnlyAllowedChars(w, allowedChars) &&
      this.wordContainsAnyAllowedChars(w, focusedChars)
    )
    const chain = new Foswig(3, filteredWords)
    return chain.generate({
      minLength: 3,
      maxLength: 10,
      allowDuplicates: true
    })
  }
}


export class ToManyTroublesKeyGenerator implements IWordGenerator {
  private keys(context: Context): KeyData[] {
    return context.getActive().filter(x => x.focus === true)
  }

  getWeight(context: Context): number {
    return this.keys(context).length >= 3 ? 99999 : 0
  }

  generate(context: Context): string {
    const result = ""
    const allowedKeys = this.keys(context)
    return allowedKeys[0].key + allowedKeys[1].key
  }
}

// export class WordWithNewCharGenerator implements IWordGenerator {
//     getWeight(context: IGenerationContext): number {
//         const isThereWords = context.allowedChars.length > 5 ? 1 : 0
//         const newChar = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].hits < 10)
//         return isThereWords * newChar.length * 2
//     }

//     generate(context: IGenerationContext): string {
//         const newChar = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].hits < 10)
//         const filteredWords = words.filter(
//             (w: string) => w.split('').filter(c => context.allowedChars.indexOf(c) < 0 && trobledKeys).length === 0
//         )
//         const filteredWords2 = filteredWords.filter(
//             (w: string) => w.split('').filter(c => newChar.indexOf(c) < 0).length === 0
//         )
//         console.log("!", newChar, filteredWords)
//         const chain = new Foswig(3, filteredWords);
//         return chain.generate({
//             minLength: 3,
//             maxLength: 10,
//             allowDuplicates: true
//         });
//     }
// }

export class WordGenerator implements IWordGenerator {
  private keys(context: Context): KeyData[] {
    return context.getActive()
  }

  private wordContainsOnlyAllowedChars(word: string, allowedChars: string[]): boolean {
    return word.split('').filter(c => allowedChars.indexOf(c) < 0).length === 0
  }

  getWeight(context: Context): number {
    return this.keys(context).length > 5 ? 1 : 0
  }

  generate(context: Context): string {
    const allowedChars = this.keys(context).map(x => x.key)
    const filteredWords = words.filter(w => this.wordContainsOnlyAllowedChars(w, allowedChars))
    const chain = new Foswig(3, filteredWords)
    return chain.generate({
      minLength: 3,
      maxLength: 10,
      allowDuplicates: true
    })
  }
}

export class TextGenerator {
  private wordGenerators: IWordGenerator[] = []

  constructor() {
    this.wordGenerators.push(new TrobledKeyGenerator())
    this.wordGenerators.push(new CharPairGenerator())
    this.wordGenerators.push(new WordGenerator())
    this.wordGenerators.push(new WordWithTroubledCharGenerator())
    this.wordGenerators.push(new ToManyTroublesKeyGenerator())

    // this.wordGenerators.push(new WordWithNewCharGenerator())

  }

  generate(context: Context) {
    const totalWordsToGenerate = 10
    const totalWeight = this.wordGenerators.map(x => x.getWeight(context)).reduce((a, b) => a + b, 0)
    const words = []

    for (const generator of this.wordGenerators) {
      const wordsToGenerate = generator.getWeight(context) / totalWeight * totalWordsToGenerate
      for (let i = 0; i < wordsToGenerate; i++) {
        words.push(generator.generate(context))
      }
    }
    return words
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
      .join(" ")
  }
}