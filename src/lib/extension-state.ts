export const disabledOrigins = storage.defineItem<string[]>(
  "local:jsonVisualiser:disabledOrigins",
  { fallback: [] },
);

export async function isOriginDisabled(origin: string): Promise<boolean> {
  const list = await disabledOrigins.getValue();
  return list.includes(origin);
}

export async function setOriginDisabled(
  origin: string,
  disabled: boolean,
): Promise<void> {
  const list = await disabledOrigins.getValue();
  const next = disabled
    ? Array.from(new Set([...list, origin]))
    : list.filter((o) => o !== origin);
  await disabledOrigins.setValue(next);
}
