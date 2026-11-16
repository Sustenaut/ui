import type { ReactNode } from "react";

export type Device = {
  key: string;
  name: ReactNode;
  /** A tag after the name, e.g. "This device" or "New country". */
  badge?: ReactNode;
  country?: ReactNode;
  lastSeen?: ReactNode;
  /** What can be done with it, e.g. a "Forget" button, or a word when nothing can. */
  action?: ReactNode;
};

/** The devices someone has signed in from: one row each with its name and a tag, its country,
 *  the day it was last seen and an action. Scrolls sideways on a phone. */
export function DeviceList({
  devices,
  caption,
  headers = { device: "Device", country: "Country", lastSeen: "Last seen", action: "Actions" },
  empty,
}: {
  devices: Device[];
  caption?: string;
  /** The column headings, for translation; "action" is read out but not shown. */
  headers?: { device: string; country: string; lastSeen: string; action: string };
  /** Shown instead of the table when there are no devices. */
  empty?: ReactNode;
}) {
  if (devices.length === 0 && empty) return <p className="m-0 text-muted">{empty}</p>;
  return (
    <div className="overflow-x-auto rounded-panel border border-rule bg-surface">
      <table className="w-full border-collapse text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead>
          <tr className="bg-sunken text-left">
            <th scope="col" className="px-3.5 py-2.5 font-bold">
              {headers.device}
            </th>
            <th scope="col" className="px-3.5 py-2.5 font-bold">
              {headers.country}
            </th>
            <th scope="col" className="px-3.5 py-2.5 font-bold">
              {headers.lastSeen}
            </th>
            <th scope="col" className="px-3.5 py-2.5">
              <span className="sr-only">{headers.action}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {devices.map((d) => (
            <tr key={d.key} className="border-t border-rule">
              <td className="px-3.5 py-2.5">
                <span className="flex flex-wrap items-center gap-2">
                  <strong>{d.name}</strong>
                  {d.badge && <span className="rounded-full bg-sunken px-2.5 py-0.5 text-xs">{d.badge}</span>}
                </span>
              </td>
              <td className="px-3.5 py-2.5">{d.country}</td>
              <td className="px-3.5 py-2.5 tabular-nums">{d.lastSeen}</td>
              <td className="px-3.5 py-2.5 text-right">{d.action}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
