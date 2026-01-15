export function getGuestLimits(tableNumber: number):{min:number; max:number}{
    if (tableNumber === 1 || tableNumber === 8) {
    return { min: 1, max: 8 };
  }

  if (tableNumber >= 9 && tableNumber <= 13) {
    return { min: 1, max: 2 };
  }

  if (tableNumber >= 3 && tableNumber <= 7) {
    return { min: 1, max: 4 };
  }

  if (tableNumber === 2) {
    return { min: 1, max: 6 };
  }

  return { min: 1, max: 1 };
}