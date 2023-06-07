export interface ArrayMoveOptions<T> {
  array: T[];
  oldIndex: number;
  newIndex: number;
  newArray?: T[];
}

export function arrayMove<T>(options: ArrayMoveOptions<T>) {
  const { array, oldIndex, newIndex, newArray } = options;

  const element = array[oldIndex];
  array.splice(oldIndex, 1);
  (newArray || array).splice(newIndex, 0, element);
}
