import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBadgeData } from "../lib/api";
import type { BadgeData } from "../types";

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString([], {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function BadgePrintPage() {
  const { id } = useParams<{ id: string }>();
  const [badge, setBadge] = useState<BadgeData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getBadgeData(id)
      .then((data: BadgeData) => {
        setBadge(data);
        setTimeout(() => window.print(), 400);
      })
      .catch((err: any) => setError(err.message));
  }, [id]);

  if (error) {
    return <div className="p-8 text-red-600">{error}</div>;
  }

  if (!badge) {
    return <div className="p-8 text-gray-500">Loading badge…</div>;
  }

  return (
    <div id="badge-root" className="min-h-screen bg-gray-100 flex items-center justify-center print:bg-white print:block">
      <div className="bg-white border-2 border-gray-300 rounded-lg w-72 p-6 shadow-lg print:shadow-none print:border-gray-400">
        <div className="text-center mb-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">{badge.property_name}</p>
          <p className="text-xs text-gray-400 mt-0.5">VISITOR PASS</p>
        </div>
        {badge.photo_url && (
          <div className="flex justify-center mb-4">
            <img
              src={badge.photo_url}
              alt={badge.name}
              className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
            />
          </div>
        )}
        <div className="text-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">{badge.name}</h2>
          {badge.badge_number && (
            <p className="text-xs text-gray-400 mt-1 font-mono">{badge.badge_number}</p>
          )}
        </div>
        <div className="border-t pt-3 flex flex-col gap-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Host</span>
            <span className="font-medium text-gray-900">{badge.host_name}</span>
          </div>
          {badge.purpose && (
            <div className="flex justify-between">
              <span className="text-gray-500">Purpose</span>
              <span className="text-gray-900">{badge.purpose}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Check In</span>
            <span className="text-gray-900">{formatDateTime(badge.checked_in_at)}</span>
          </div>
        </div>
      </div>
      <div className="mt-6 text-center print:hidden">
        <button onClick={() => window.print()} className="btn-primary mr-2">
          Print
        </button>
        <button onClick={() => window.close()} className="btn-secondary">
          Close
        </button>
      </div>
    </div>
  );
}
