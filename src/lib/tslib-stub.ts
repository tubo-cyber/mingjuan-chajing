/** Never resolve the `tslib` npm package. Any leftover import is rewritten here. */
export const __assign = Object.assign;

export function __rest(source: Record<string, unknown>, exclude: PropertyKey[]) {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(source)) {
    if (!exclude.includes(key)) out[key] = source[key];
  }
  return out;
}

export function __spreadArray(to: unknown[], from: ArrayLike<unknown>) {
  const out = to.slice();
  for (let i = 0; i < from.length; i++) out.push(from[i]);
  return out;
}

export function __spreadArrays(...args: unknown[][]) {
  return args.flat();
}

export const __extends = Object.setPrototypeOf;

export default {
  __assign,
  __rest,
  __spreadArray,
  __spreadArrays,
  __extends,
};
