"use client";

import { KeyboardEvent, useState } from "react";
import { Plus, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type TagInputProps = {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;

  placeholder?: string;
  description?: string;

  disabled?: boolean;
  maxTags?: number;
};

export default function TagInput({
  label,
  value,
  onChange,
  placeholder = "Type then press Enter...",
  description,
  disabled = false,
  maxTags,
}: TagInputProps) {
  const [input, setInput] = useState("");

  const addTag = () => {
    const tag = input.trim();

    if (!tag) return;

    // Hindari duplicate
    if (
      value.some(
        (item) => item.toLowerCase() === tag.toLowerCase()
      )
    ) {
      setInput("");
      return;
    }

    if (maxTags && value.length >= maxTags) {
      return;
    }

    onChange([...value, tag]);

    setInput("");
  };

  const removeTag = (index: number) => {
    if (disabled) return;

    onChange(value.filter((_, i) => i !== index));
  };

  const onKeyDown = (
    e: KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  return (
    <div className="space-y-4">

      <div className="space-y-1">

        <Label>{label}</Label>

        {description && (
          <p className="text-sm text-muted-foreground">
            {description}
          </p>
        )}

      </div>

      <div className="flex gap-2">

        <Input
          value={input}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={onKeyDown}
        />

        <Button
          type="button"
          disabled={disabled}
          onClick={addTag}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add
        </Button>

      </div>

      <div className="flex flex-wrap gap-2">

        {value.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No data.
          </p>
        )}

        {value.map((tag, index) => (

          <Badge
            key={`${tag}-${index}`}
            variant="secondary"
            className="flex items-center gap-2 px-3 py-1"
          >
            <span>{tag}</span>

            {!disabled && (
              <button
                type="button"
                onClick={() => removeTag(index)}
                className="hover:text-red-500 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

          </Badge>

        ))}

      </div>

      {maxTags && (
        <p className="text-xs text-muted-foreground">
          {value.length} / {maxTags} Tags
        </p>
      )}

    </div>
  );
}