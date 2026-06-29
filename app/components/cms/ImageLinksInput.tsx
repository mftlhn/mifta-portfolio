"use client";

import Image from "next/image";
import { Plus, Trash2, ImageIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ImageLinksInputProps = {
  label?: string;
  value: string[];
  onChange: (value: string[]) => void;
};

export default function ImageLinksInput({
  label = "Images",
  value,
  onChange,
}: ImageLinksInputProps) {
  const addImage = () => {
    onChange([...value, ""]);
  };

  const updateImage = (index: number, url: string) => {
    const newImages = [...value];
    newImages[index] = url;
    onChange(newImages);
  };

  const removeImage = (index: number) => {
    onChange(value.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">

      <div className="space-y-1">
        <Label>{label}</Label>

        <p className="text-sm text-muted-foreground">
          Masukkan URL gambar Cloudinary.
        </p>
      </div>

      <div className="space-y-4">

        {value.length === 0 && (
          <Card className="p-6 border-dashed text-center">

            <ImageIcon className="mx-auto h-10 w-10 text-muted-foreground mb-3" />

            <p className="text-sm text-muted-foreground">
              Belum ada gambar
            </p>

          </Card>
        )}

        {value.map((url, index) => (

          <Card
            key={index}
            className="p-4 space-y-4"
          >

            <div className="flex gap-2">

              <Input
                placeholder="https://res.cloudinary.com/..."
                value={url}
                onChange={(e) =>
                  updateImage(index, e.target.value)
                }
              />

              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>

            </div>

            {url && (
              <div className="relative overflow-hidden rounded-lg border aspect-video">

                <Image
                  src={url}
                  alt={`Preview ${index + 1}`}
                  fill
                  className="object-cover"
                  unoptimized
                />

              </div>
            )}

          </Card>

        ))}

      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addImage}
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Image
      </Button>

    </div>
  );
}