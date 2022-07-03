import Foswig from 'foswig';
import { words } from "./words_en"
import type { KeyData } from "./statistics"

export interface IGenerationContext {
    allowedChars: string[],
    keyData: { [key: string]: KeyData }
}

export interface IWordGenerator {
    getWeight(context: IGenerationContext): number
    generate(context: IGenerationContext): string
}

export class CharPairGenerator implements IWordGenerator {
    getWeight(context: IGenerationContext): number {
        return context.allowedChars.length <= 5 ? 1 : 0
    }

    generate(context: IGenerationContext): string {
        let result = ""
        const wordLength = Math.random() * 6

        for (var i = 0; i <= wordLength; i++) {
            const index = Math.floor(Math.random() * context.allowedChars.length)
            result += context.allowedChars[index];
        }
        return result
    }
}

export class TrobledKeyGenerator implements IWordGenerator {
    getWeight(context: IGenerationContext): number {
        const trobledKeys = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].focus)
        return trobledKeys.length
    }

    generate(context: IGenerationContext): string {
        let result = ""
        const wordLength = Math.random() * 6
        const trobledKeys = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].focus)

        for (var i = 0; i <= wordLength; i++) {
            const index = Math.floor(Math.random() * trobledKeys.length)
            result += trobledKeys[index];
        }
        return result
    }
}

export class WordWithTroubledCharGenerator implements IWordGenerator {
    getWeight(context: IGenerationContext): number {
        if (context.allowedChars.length <= 5) { return 0 }
        const trobledKeys = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].focus)
        return trobledKeys.length
    }

    generate(context: IGenerationContext): string {
        const trobledKeys = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].focus)
        const filteredWords = words.filter(
            (w: string) => w.split('').filter(c => context.allowedChars.indexOf(c) < 0 && trobledKeys.indexOf(c) < 0).length === 0
        )
        const chain = new Foswig(3, filteredWords);
        return chain.generate({
            minLength: 3,
            maxLength: 10,
            allowDuplicates: true
        });
    }
}

export class WordGenerator implements IWordGenerator {
    getWeight(context: IGenerationContext): number {
        return context.allowedChars.length > 5 ? 1 : 0
    }

    generate(context: IGenerationContext): string {
        const filteredWords = words.filter(
            (w: string) => w.split('').filter(c => context.allowedChars.indexOf(c) < 0).length === 0
        )
        const chain = new Foswig(3, filteredWords);
        return chain.generate({
            minLength: 3,
            maxLength: 10,
            allowDuplicates: true
        });
    }
}

export class TextGenerator {
    private wordGenerators: IWordGenerator[] = []

    constructor() {
        this.wordGenerators.push(new TrobledKeyGenerator())
        this.wordGenerators.push(new CharPairGenerator())
        this.wordGenerators.push(new WordGenerator())
        this.wordGenerators.push(new WordWithTroubledCharGenerator())
    }

    generate(context: IGenerationContext) {
        const totalWordsToGenerate = 10
        const totalWeight = this.wordGenerators.map(x => x.getWeight(context)).reduce((a, b) => a + b, 0)
        const words = []

        for (const generator of this.wordGenerators) {
            const wordsToGenerate = generator.getWeight(context) / totalWeight * totalWordsToGenerate
            for (var i = 0; i < wordsToGenerate; i++) {
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