import { CopyButton } from "./copy-button";

type ButtonConfig = {
  searchString: string;
  label: string;
};

export function DualCopyButtons({ buttons }: { buttons: ButtonConfig[] }) {
  const filtered = buttons.filter((b) => b.searchString);
  if (filtered.length === 0) return null;

  if (filtered.length === 1) {
    const btn = filtered[0]!;
    return <CopyButton searchString={btn.searchString} label={btn.label} />;
  }

  return (
    <div className="flex gap-2">
      {filtered.map((b, i) => (
        <div key={i} className="flex-1">
          <CopyButton searchString={b.searchString} label={b.label} compact />
        </div>
      ))}
    </div>
  );
}
