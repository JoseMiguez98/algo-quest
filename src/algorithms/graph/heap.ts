export interface HeapEntry {
  node: number;
  /** Lexicographic priority; the insertion sequence breaks remaining ties. */
  key: number[];
  seq: number;
}

const less = (a: HeapEntry, b: HeapEntry): boolean => {
  for (let i = 0; i < Math.max(a.key.length, b.key.length); i++) {
    const d = (a.key[i] ?? 0) - (b.key[i] ?? 0);
    if (d !== 0) return d < 0;
  }
  return a.seq < b.seq;
};

export class MinHeap {
  private readonly items: HeapEntry[] = [];
  private seq = 0;

  get size(): number {
    return this.items.length;
  }

  push(node: number, key: number[]): HeapEntry {
    const e = { node, key, seq: this.seq++ };
    const a = this.items;
    a.push(e);
    for (let i = a.length - 1; i > 0; ) {
      const p = (i - 1) >> 1;
      if (!less(a[i]!, a[p]!)) break;
      [a[i], a[p]] = [a[p]!, a[i]!];
      i = p;
    }
    return e;
  }

  pop(): HeapEntry | undefined {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length && last) {
      a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1;
        const r = l + 1;
        let m = i;
        if (l < a.length && less(a[l]!, a[m]!)) m = l;
        if (r < a.length && less(a[r]!, a[m]!)) m = r;
        if (m === i) break;
        [a[i], a[m]] = [a[m]!, a[i]!];
        i = m;
      }
    }
    return top;
  }

  /** Entries in extraction order, for display. */
  sorted(): HeapEntry[] {
    return this.items.slice().sort((x, y) => (less(x, y) ? -1 : 1));
  }
}
