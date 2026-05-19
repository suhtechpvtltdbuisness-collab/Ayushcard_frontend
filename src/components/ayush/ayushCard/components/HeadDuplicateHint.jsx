import { Loader2 } from "lucide-react";

/** Inline validation hint when checking if head phone/name/Aadhaar is already registered. */
export default function HeadDuplicateHint({ check, kind }) {
  if (check.error)
    return <p className="text-[12px] text-red-600 mt-1">{check.error}</p>;
  if (check.loading)
    return (
      <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1">
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
        Checking registration…
      </p>
    );
  if (check.exists === null) return null;
  if (check.exists)
    return (
      <p className="text-[12px] text-amber-800 mt-1 leading-snug">
        A card is already registered with this {kind}.
      </p>
    );
  return (
    <p className="text-[12px] text-green-700 mt-1">
      No existing card found for this {kind}.
    </p>
  );
}
