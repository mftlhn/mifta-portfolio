"use client";

import Image from "next/image";
import { ImageIcon, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type Props = {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
};

export default function ImageLinksInput({
  label = "Project Images",
  value,
  onChange,
}: Props) {
  const addImage = () => {
    onChange([...value, ""]);
  };

  const updateImage = (index: number, url: string) => {
    const images = [...value];
    images[index] = url;
    onChange(images);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">

      <div className="flex items-center justify-between">

        <Label>{label}</Label>

        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={addImage}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Image
        </Button>

      </div>

      {value.length === 0 && (
        <div className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
          No images yet.
        </div>
      )}

      <div className="space-y-3">

        {value.map((url, index) => (

          <div
            key={index}
            className="flex items-center gap-4 rounded-lg border p-3"
          >

            {/* Thumbnail */}

            <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-md border bg-muted">

              {url ? (
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  width={120}
                  height={80}
                  className="h-full w-full object-cover"
                  unoptimized
                />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}

            </div>

            {/* URL */}

            <div className="flex-1">

              <Input
                placeholder="https://res.cloudinary.com/..."
                value={url}
                onChange={(e) =>
                  updateImage(index, e.target.value)
                }
              />

            </div>

            {/* Delete */}

            <Button
              type="button"
              variant="destructive"
              size="icon"
              onClick={() => removeImage(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>

          </div>

        ))}

      </div>

    </div>
  );
}