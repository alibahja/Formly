import React from "react";
import {
  GripVerticalIcon, TrashIcon, CopyIcon,
  TypeIcon, MailIcon, HashIcon, AlignLeftIcon,
  ChevronDownIcon, CircleDotIcon, CheckSquareIcon, CalendarIcon,
} from "lucide-react";

const ICONS = {
  text: TypeIcon,
  email: MailIcon,
  number: HashIcon,
  textarea: AlignLeftIcon,
  select: ChevronDownIcon,
  radio: CircleDotIcon,
  checkbox: CheckSquareIcon,
  date: CalendarIcon,
};

const TYPE_LABEL = {
  text: "Short text",
  email: "Email",
  number: "Number",
  textarea: "Long text",
  select: "Dropdown",
  radio: "Single choice",
  checkbox: "Multiple choice",
  date: "Date",
};

const FieldCard = ({ field, isSelected, onSelect, onDelete, onDuplicate }) => {
  const Icon = ICONS[field.type] || TypeIcon;

  return (
    <div
      onClick={onSelect}
      className={`group flex items-center gap-3 p-3 rounded-lg border transition cursor-pointer ${
        isSelected
          ? "bg-zinc-900 border-zinc-900 text-white"
          : "bg-white border-zinc-200 hover:border-zinc-300"
      }`}
    >
      {/* Drag handle (visual only for now) */}
      <GripVerticalIcon
        size={14}
        className={`shrink-0 ${isSelected ? "text-white/40" : "text-zinc-300"}`}
      />

      {/* Icon */}
      <div
        className={`flex items-center justify-center rounded-md size-7 shrink-0 ${
          isSelected ? "bg-white/10 text-white" : "bg-zinc-100 text-zinc-500"
        }`}
      >
        <Icon size={14} />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            isSelected ? "text-white" : "text-zinc-800"
          }`}
        >
          {field.label}
        </p>
        <p
          className={`text-xs mt-0.5 ${
            isSelected ? "text-white/60" : "text-zinc-400"
          }`}
        >
          {TYPE_LABEL[field.type] || field.type}
          {field.required && " • required"}
        </p>
      </div>

      {/* Actions (visible on hover or when selected) */}
      <div
        className={`flex items-center gap-0.5 shrink-0 transition ${
          isSelected ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
      >
        {onDuplicate && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDuplicate();
            }}
            aria-label="Duplicate field"
            className={`p-1.5 rounded-md transition ${
              isSelected
                ? "text-white/60 hover:text-white hover:bg-white/10"
                : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
            }`}
          >
            <CopyIcon size={13} />
          </button>
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          aria-label="Delete field"
          className={`p-1.5 rounded-md transition ${
            isSelected
              ? "text-white/60 hover:text-red-400 hover:bg-red-500/10"
              : "text-zinc-400 hover:text-red-500 hover:bg-red-50"
          }`}
        >
          <TrashIcon size={13} />
        </button>
      </div>
    </div>
  );
};

export default FieldCard;