import { useId } from "react";
import { cn } from "../cn";

export type LocaleOption = { code: string; label: string; flag: string };

/** Choose the page's language: the current flag opens a list of flags with each language's own name.
 *  `flag` is an image URL; the parent supplies the options and what happens on a choice. */
export function LocaleMenu({
  options,
  value,
  onChange,
  label,
}: {
  options: LocaleOption[];
  value: string;
  onChange: (code: string) => void;
  /** The control's accessible name, in the current language, e.g. "Language". */
  label: string;
}) {
  const id = useId();
  const current = options.find((o) => o.code === value) ?? options[0];
  return (
    <details className="group relative">
      <summary
        aria-label={`${label}: ${current.label}`}
        className="flex min-h-9 cursor-pointer list-none items-center gap-1.5 rounded-full border border-rule px-2 py-1 text-sm hover:border-primary focus-visible:outline-3 focus-visible:outline-accent [&::-webkit-details-marker]:hidden"
      >
        <img src={current.flag} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
        <span className="font-bold uppercase">{current.code}</span>
      </summary>
      <ul
        id={id}
        role="listbox"
        aria-label={label}
        className="absolute top-full right-0 z-30 m-0 mt-1.5 min-w-44 list-none rounded-control border border-rule-strong bg-surface p-1 shadow-lg"
      >
        {options.map((o) => (
          <li key={o.code} role="option" aria-selected={o.code === value}>
            <button
              type="button"
              lang={o.code}
              onClick={(e) => {
                onChange(o.code);
                e.currentTarget.closest("details")?.removeAttribute("open");
              }}
              className={cn(
                "flex w-full cursor-pointer items-center gap-2.5 rounded-md px-2.5 py-2 text-left hover:bg-sunken",
                o.code === value && "bg-accent-soft font-bold",
              )}
            >
              <img src={o.flag} alt="" className="h-3.5 w-5 rounded-[2px] object-cover" />
              {o.label}
            </button>
          </li>
        ))}
      </ul>
    </details>
  );
}
