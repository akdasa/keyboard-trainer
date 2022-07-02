export class KeyData {
    constructor(
        public readonly key: string,
        public readonly active: boolean = false,
        public hits: number = 0,
        public mistakes: number = 0
    ) {}

    addHit(mistake: boolean=false) {
        this.hits += 1
        this.mistakes += mistake ? 0 : 1
    }

    get accuracy() : number {
        return this.mistakes / this.hits || 0
    }

    get progress() : number {
        const initialAccuracy = (this.hits / 10)
        return this.hits <= 100
            ? Math.min(initialAccuracy, this.accuracy)
            : this.accuracy
    }
}