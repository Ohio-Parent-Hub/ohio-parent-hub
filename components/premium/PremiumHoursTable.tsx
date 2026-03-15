import { Clock } from "lucide-react";
import type { PremiumHours } from "@/lib/premiumTypes";

const DAY_LABELS: Record<string, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

const DAY_ORDER = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

function formatTime(time24: string): string {
  const [hourStr, minuteStr] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const minute = minuteStr || "00";
  const period = hour >= 12 ? "PM" : "AM";
  if (hour === 0) hour = 12;
  else if (hour > 12) hour -= 12;
  return `${hour}:${minute} ${period}`;
}

export default function PremiumHoursTable({ hours }: { hours: PremiumHours }) {
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center gap-2">
        <Clock className="h-5 w-5" style={{ color: "#7EA8A4" }} />
        <h3 className="font-serif text-2xl font-bold" style={{ color: "#4A6B67" }}>
          Hours of Operation
        </h3>
      </div>
      <div className="overflow-hidden rounded-xl border" style={{ borderColor: "#B8C5B255" }}>
        <table className="w-full text-sm">
          <tbody>
            {DAY_ORDER.map((day) => {
              const dayData = hours[day];
              return (
                <tr
                  key={day}
                  className="border-b last:border-b-0"
                  style={{ borderColor: "#B8C5B222" }}
                >
                  <td
                    className="px-4 py-3 font-medium"
                    style={{ color: "#4A6B67", width: "120px" }}
                  >
                    {DAY_LABELS[day]}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ color: dayData.open ? "#4A6B67" : "#4A6B6788" }}
                  >
                    {dayData.open ? (
                      dayData.ranges.map((range, i) => (
                        <span key={i}>
                          {i > 0 && (
                            <span className="mx-1 text-xs" style={{ color: "#B8C5B2" }}>
                              •
                            </span>
                          )}
                          {formatTime(range[0])} – {formatTime(range[1])}
                        </span>
                      ))
                    ) : (
                      "Closed"
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
