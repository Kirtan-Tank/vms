import { useActiveVisitors } from "../hooks/useActiveVisitors";
import { VisitorRow } from "../components/VisitorRow";
import type { UserProfile } from "../types";

interface Props {
  profile: UserProfile | null;
}

export function ActiveVisitorsPage({ profile }: Props) {
  const { visitors, loading, removeVisitor } = useActiveVisitors(profile?.property_id ?? null);

  if (!profile) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-semibold text-gray-900">Active Visitors</h2>
        <span className="bg-green-100 text-green-700 text-sm px-3 py-1 rounded-full font-medium">
          {visitors.length} inside
        </span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {loading ? (
          <p className="p-6 text-gray-500 text-sm">Loading…</p>
        ) : visitors.length === 0 ? (
          <p className="p-6 text-gray-500 text-sm">No visitors currently on premises.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Visitor</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Host</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Purpose</th>
                <th className="py-3 px-4 text-left font-medium text-gray-600">Checked In</th>
                <th className="py-3 px-4"></th>
              </tr>
            </thead>
            <tbody>
              {visitors.map((v) => (
                <VisitorRow key={v.id} visitor={v} onCheckedOut={() => removeVisitor(v.id)} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
