export function arrayToString(
  texts: string[],
  separator: string,
): string {
  const part1 = texts.slice(0, -1).join(', ');
  const part2 = texts.slice(-1);
  if (texts.length === 1) {
    return texts[0];
  }
  return  `${part1} ${separator} ${part2}`;
}

export function nodeListToArray(
  nodeList: NodeListOf<Element>,
): HTMLButtonElement[] {
  return [].slice.call(nodeList);
}
