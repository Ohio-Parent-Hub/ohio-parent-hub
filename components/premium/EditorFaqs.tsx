"use client";

import { useRef, useState, useEffect } from "react";
import type { PremiumFaq } from "@/lib/premiumTypes";
import { Plus, X, GripVertical, ArrowUp, ArrowDown } from "lucide-react";

/** Internal FAQ with a stable id for React keys during reorder */
type FaqWithId = PremiumFaq & { _id: number };

type Props = {
  faqs: PremiumFaq[];
  onChange: (faqs: PremiumFaq[]) => void;
};

const MAX_FAQS = 5;

const QUESTION_PLACEHOLDERS = [
  "What is your sick child policy?",
  "Do you offer potty training support?",
  "What does a typical day look like?",
  "What curriculum do you follow?",
  "Do you accept childcare subsidies?",
];

const ANSWER_PLACEHOLDERS = [
  "Describe your policy so parents know what to expect...",
  "Tell parents about your approach...",
  "Walk parents through a sample schedule...",
  "Share details about your educational approach...",
  "Let parents know what payment options you accept...",
];

let nextFaqId = 1;

/** Strip internal _id before calling parent onChange */
function toPublic(items: FaqWithId[]): PremiumFaq[] {
  return items.map(({ question, answer }) => ({ question, answer }));
}

export default function EditorFaqs({ faqs, onChange }: Props) {
  const gripActiveRef = useRef(false);
  const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Internal list with stable IDs — sync from parent only on length changes
  const [items, setItems] = useState<FaqWithId[]>(() =>
    faqs.map((f) => ({ ...f, _id: nextFaqId++ }))
  );

  // Sync when parent adds/removes FAQs externally (length changes)
  const prevLenRef = useRef(faqs.length);
  useEffect(() => {
    if (faqs.length !== prevLenRef.current) {
      prevLenRef.current = faqs.length;
      // Preserve existing IDs for items that still match, assign new IDs for new ones
      setItems(faqs.map((f, i) => ({ ...f, _id: items[i]?._id ?? nextFaqId++ })));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faqs.length]);

  /** Propagate changes up and update internal state */
  function commit(next: FaqWithId[]) {
    setItems(next);
    prevLenRef.current = next.length;
    onChange(toPublic(next));
  }

  function updateFaq(index: number, field: "question" | "answer", value: string) {
    const next = items.map((f, i) => (i === index ? { ...f, [field]: value } : f));
    commit(next);
  }

  function addFaq() {
    if (items.length >= MAX_FAQS) return;
    commit([...items, { question: "", answer: "", _id: nextFaqId++ }]);
  }

  function removeFaq(index: number) {
    commit(items.filter((_, i) => i !== index));
  }

  function moveFaq(from: number, to: number) {
    if (to < 0 || to >= items.length) return;
    const next = [...items];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    commit(next);
  }

  return (
    <div>
      <div className="space-y-4">
        {items.map((faq, index) => {
          // Show indicator when the drop would actually move the item
          const showIndicator =
            dragOverIndex === index &&
            draggingIndex !== null &&
            draggingIndex !== index &&
            draggingIndex !== index - 1; // dragging above → dropping at index is a no-op visually

          return (
            <div key={faq._id}>
              {/* Drop indicator line */}
              {showIndicator && (
                <div className="mb-1 h-0.5 rounded-full" style={{ backgroundColor: "#7EA8A4" }} />
              )}
              <div
                className={`rounded-xl border p-4 transition-opacity ${
                  draggingIndex === index ? "opacity-40" : ""
                }`}
                style={{ borderColor: "#B8C5B2" }}
                draggable
                onDragStart={(e) => {
                  if (!gripActiveRef.current) {
                    e.preventDefault();
                    return;
                  }
                  setDraggingIndex(index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = "move";
                  setDragOverIndex(index);
                }}
                onDragLeave={() => {
                  setDragOverIndex((prev) => (prev === index ? null : prev));
                }}
                onDrop={() => {
                  if (draggingIndex !== null && draggingIndex !== index) {
                    moveFaq(draggingIndex, index);
                  }
                  setDraggingIndex(null);
                  gripActiveRef.current = false;
                  setDragOverIndex(null);
                }}
                onDragEnd={() => {
                  setDraggingIndex(null);
                  gripActiveRef.current = false;
                  setDragOverIndex(null);
                }}
              >
            <div className="mb-2 flex items-center gap-2">
              {/* Drag handle — only this triggers drag */}
              <span
                className="cursor-grab text-gray-300 hover:text-gray-400"
                onMouseDown={() => { gripActiveRef.current = true; }}
                onMouseUp={() => { gripActiveRef.current = false; }}
              >
                <GripVertical className="h-4 w-4" />
              </span>
              <span className="text-xs font-medium" style={{ color: "#6B8A86" }}>
                FAQ {index + 1}
              </span>
              <div className="ml-auto flex items-center gap-1">
                {/* Move buttons for accessibility */}
                {index > 0 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveFaq(index, index - 1); }}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                    aria-label="Move up"
                  >
                    <ArrowUp className="h-3.5 w-3.5" />
                  </button>
                )}
                {index < items.length - 1 && (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); moveFaq(index, index + 1); }}
                    className="rounded p-0.5 text-gray-400 hover:text-gray-600"
                    aria-label="Move down"
                  >
                    <ArrowDown className="h-3.5 w-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="rounded-full p-0.5 text-red-400 hover:text-red-600"
                  aria-label="Remove FAQ"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Question */}
            <div className="mb-2">
              <label className="mb-1 block text-xs font-medium" style={{ color: "#6B8A86" }}>
                Q:
              </label>
              <input
                type="text"
                value={faq.question}
                onChange={(e) => updateFaq(index, "question", e.target.value)}
                maxLength={200}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                placeholder={QUESTION_PLACEHOLDERS[index % QUESTION_PLACEHOLDERS.length]}
              />
              <p className="mt-0.5 text-right text-[10px]" style={{ color: "#9CA3AF" }}>
                {faq.question.length}/200
              </p>
            </div>

            {/* Answer */}
            <div>
              <label className="mb-1 block text-xs font-medium" style={{ color: "#6B8A86" }}>
                A:
              </label>
              <textarea
                value={faq.answer}
                onChange={(e) => updateFaq(index, "answer", e.target.value)}
                maxLength={1000}
                rows={3}
                className="w-full rounded border px-3 py-2 text-sm focus:outline-none focus:ring-1"
                style={{ borderColor: "#D5E5E3", color: "#4A6B67" }}
                placeholder={ANSWER_PLACEHOLDERS[index % ANSWER_PLACEHOLDERS.length]}
              />
              <p className="mt-0.5 text-right text-[10px]" style={{ color: "#9CA3AF" }}>
                {faq.answer.length}/1,000
              </p>
            </div>
              </div>
            </div>
          );
        })}

        {/* Bottom drop zone — allows dragging to last position */}
        {draggingIndex !== null && draggingIndex < items.length - 1 && (
          <div
            className="mt-1 rounded-lg py-3"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "move";
              setDragOverIndex(items.length);
            }}
            onDragLeave={() => setDragOverIndex((prev) => (prev === items.length ? null : prev))}
            onDrop={() => {
              if (draggingIndex !== null) {
                moveFaq(draggingIndex, items.length - 1);
              }
              setDraggingIndex(null);
              gripActiveRef.current = false;
              setDragOverIndex(null);
            }}
          >
            {dragOverIndex === items.length && (
              <div className="h-0.5 rounded-full" style={{ backgroundColor: "#7EA8A4" }} />
            )}
          </div>
        )}
      </div>

      {items.length < MAX_FAQS && (
        <button
          type="button"
          onClick={addFaq}
          className="mt-3 flex items-center gap-1 text-sm hover:underline"
          style={{ color: "#7EA8A4" }}
        >
          <Plus className="h-4 w-4" /> Add FAQ
        </button>
      )}

      {items.length === 0 && (
        <p className="mt-2 text-xs" style={{ color: "#9CA3AF" }}>
          Add up to 5 custom FAQ pairs. These will appear above the auto-generated FAQs on
          your public page.
        </p>
      )}
    </div>
  );
}
