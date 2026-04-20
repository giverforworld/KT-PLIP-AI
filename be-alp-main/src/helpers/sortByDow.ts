export function sortByDow(data: any) {
  const dayOrder = [2, 3, 4, 5, 6, 7, 1];
  const sortedData = data.sort((a: any, b: any) => {
    return dayOrder.indexOf(a.key) - dayOrder.indexOf(b.key);
  });
  return sortedData;
}
