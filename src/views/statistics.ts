export class KeyData {
  constructor(
    public readonly key: string,
    public active: boolean = false,
    public focus: boolean = false,
    public hits: number = 0,
    public mistakes: number = 0
  ) { }

  addHit(mistake = false) {
    this.hits += 1
    this.mistakes += mistake ? 0 : 1

    this.focus = (
      this.hits > 5 &&
      this.accuracy <= .92
    )
  }

  get accuracy(): number {
    return this.mistakes / this.hits || 0
  }

  get progress(): number {
    const initialAccuracy = (this.hits / 50)
    return this.hits <= 100
      ? Math.min(initialAccuracy, this.accuracy)
      : this.accuracy
  }
}