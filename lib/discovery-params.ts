/** `?city=Riga` or `?city=Riga,Jelgava` → slugs; empty, 'all' or absent → [] (Visur). Trims, drops empties and duplicates. */
export function parseCities(param: string | string[] | null | undefined): string[] {
    const raw = Array.isArray(param) ? param.join(',') : (param ?? '');
    const slugs = raw.split(',').map((c) => c.trim()).filter((c) => c && c !== 'all');
    return [...new Set(slugs)];
}
