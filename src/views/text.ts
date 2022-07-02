import Foswig from 'foswig';
import { words } from "./words"
import type { KeyData } from "./statistics"

export interface IGenerationContext {
    allowedChars: string[],
    keyData: { [key: string]: KeyData }
}

export interface IWordGenerator {
    getWeight(context: IGenerationContext): number
    generate(context: IGenerationContext): string
    message(context: IGenerationContext): string
}

export class CharPairGenerator implements IWordGenerator {
    message(context: IGenerationContext): string {
        return "we generated nonsense because it is impossible to make words from these chars"
    }

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
    message(context: IGenerationContext): string {
        const trobledKeys = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].accuracy < .75)
        return "you suck with " + trobledKeys.join(', ') + " key(s)"
    }

    getWeight(context: IGenerationContext): number {
        const trobledKeys = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].hits != 0 && context.keyData[x].accuracy < .75)
        return trobledKeys.length
    }

    generate(context: IGenerationContext): string {
        let result = ""
        const wordLength = Math.random() * 6
        const trobledKeys = context.allowedChars.filter(x => context.keyData[x].active && context.keyData[x].accuracy < .75)

        for (var i = 0; i <= wordLength; i++) {
            const index = Math.floor(Math.random() * trobledKeys.length)
            result += trobledKeys[index];
        }
        return result
    }
}

export class WordGenerator implements IWordGenerator {
    message(context: IGenerationContext): string {
        return ""
    }

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

    message(context: IGenerationContext): string[] {
        const generators = this.wordGenerators.filter(x => x.getWeight(context) > 0)
        return generators.map(x => x.message(context))
    }
}