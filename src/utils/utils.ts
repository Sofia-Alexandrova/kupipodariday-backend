export function sanitizeUser(user: any) {
  if (!user) return user;
  const obj = typeof user.toJSON === 'function' ? user.toJSON() : { ...user };
  const { password, ...rest } = obj as any;
  return rest;
}

export function sanitizeAny(item: any): any {
  if (!item) return item;
  if (Array.isArray(item)) return item.map(sanitizeAny);
  if (typeof item !== 'object') return item;

  const out: any = Array.isArray(item) ? [] : {};
  for (const key of Object.keys(item)) {
    if (key === 'password') continue;
    const val = item[key];
    if (val && typeof val === 'object') {
      out[key] = sanitizeAny(val);
    } else {
      out[key] = val;
    }
  }
  return out;
}
