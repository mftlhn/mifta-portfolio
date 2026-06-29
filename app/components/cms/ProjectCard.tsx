"use client";

import { FolderGit2, Trash2 } from "lucide-react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  ProjectItem,
} from "@/lib/portfolio-data";

import TagInput from "./TagInput";
import ImageLinksInput from "./ImageLinksInput";

type Props = {
  index: number;
  value: ProjectItem;
  onChange: (value: ProjectItem) => void;
  onDelete: () => void;
};

export default function ProjectCard({
  index,
  value,
  onChange,
  onDelete,
}: Props) {

  const update = <
    K extends keyof ProjectItem
  >(
    key: K,
    fieldValue: ProjectItem[K]
  ) => {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  };

  return (
    <AccordionItem value={`project-${index}`}>

      <AccordionTrigger>

        <div className="flex flex-col items-start gap-2">

          <div className="flex items-center gap-2">

            <FolderGit2 className="h-4 w-4 text-primary" />

            <span className="font-semibold">

              {value.name || "Untitled Project"}

            </span>

          </div>

          <div className="flex gap-2">

            <Badge variant="secondary">
              {value.stack.length} Stack
            </Badge>

            <Badge variant="outline">
              {value.imageUrls?.length ?? 0} Images
            </Badge>

          </div>

        </div>

      </AccordionTrigger>

      <AccordionContent>

        <Card>

          <CardContent className="space-y-6 pt-6">

            {/* Name */}

            <div className="space-y-2">

              <Label>
                Project Name
              </Label>

              <Input
                value={value.name}
                onChange={(e) =>
                  update(
                    "name",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Description */}

            <div className="space-y-2">

              <Label>
                Description
              </Label>

              <Textarea
                rows={5}
                value={value.description}
                onChange={(e) =>
                  update(
                    "description",
                    e.target.value
                  )
                }
              />

            </div>

            {/* URL */}

            <div className="grid md:grid-cols-2 gap-4">

              <div className="space-y-2">

                <Label>
                  Demo URL
                </Label>

                <Input
                  placeholder="https://..."
                  value={value.demoUrl}
                  onChange={(e) =>
                    update(
                      "demoUrl",
                      e.target.value
                    )
                  }
                />

              </div>

              <div className="space-y-2">

                <Label>
                  Repository URL
                </Label>

                <Input
                  placeholder="https://github.com/..."
                  value={value.repoUrl}
                  onChange={(e) =>
                    update(
                      "repoUrl",
                      e.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* Stack */}

            <TagInput
              label="Tech Stack"
              description="Framework, Library, Database dll."
              placeholder="Laravel"
              value={value.stack}
              onChange={(stack) =>
                update(
                  "stack",
                  stack
                )
              }
            />

            {/* Images */}

            <ImageLinksInput
              label="Project Images"
              value={value.imageUrls ?? []}
              onChange={(images) =>
                update(
                  "imageUrls",
                  images
                )
              }
            />

            <div className="flex justify-end">

              <Button
                variant="destructive"
                type="button"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />

                Delete Project

              </Button>

            </div>

          </CardContent>

        </Card>

      </AccordionContent>

    </AccordionItem>
  );
}