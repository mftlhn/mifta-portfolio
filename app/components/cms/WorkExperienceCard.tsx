"use client";

import { BriefcaseBusiness, Trash2 } from "lucide-react";

import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import {
  Badge,
} from "@/components/ui/badge";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

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
  WorkExperienceItem,
} from "@/lib/portfolio-data";

type Props = {
  index: number;
  value: WorkExperienceItem;
  onChange: (value: WorkExperienceItem) => void;
  onDelete: () => void;
};

export default function WorkExperienceCard({
  index,
  value,
  onChange,
  onDelete,
}: Props) {
  const update = <
    K extends keyof WorkExperienceItem
  >(
    key: K,
    fieldValue: WorkExperienceItem[K]
  ) => {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  };

  return (
    <AccordionItem value={`experience-${index}`}>

      <AccordionTrigger>

        <div className="flex flex-col items-start gap-2">

          <div className="flex items-center gap-2">

            <BriefcaseBusiness className="h-4 w-4 text-primary" />

            <span className="font-semibold">
              {value.companyName || "Untitled Company"}
            </span>

          </div>

          <div className="flex gap-2 flex-wrap">

            {value.position && (
              <Badge variant="secondary">
                {value.position}
              </Badge>
            )}

            {value.yearRange && (
              <Badge variant="outline">
                {value.yearRange}
              </Badge>
            )}

          </div>

        </div>

      </AccordionTrigger>

      <AccordionContent>

        <Card>

          <CardContent className="space-y-6 pt-6">

            {/* Company */}

            <div className="space-y-2">

              <Label>
                Company Name
              </Label>

              <Input
                value={value.companyName}
                onChange={(e) =>
                  update(
                    "companyName",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Position */}

            <div className="space-y-2">

              <Label>
                Position
              </Label>

              <Input
                value={value.position}
                onChange={(e) =>
                  update(
                    "position",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Year */}

            <div className="space-y-2">

              <Label>
                Year Range
              </Label>

              <Input
                placeholder="2022 - Present"
                value={value.yearRange}
                onChange={(e) =>
                  update(
                    "yearRange",
                    e.target.value
                  )
                }
              />

            </div>

            {/* Job Description */}

            <div className="space-y-2">

              <Label>
                Job Description
              </Label>

              <Textarea
                rows={6}
                value={value.jobdesk}
                onChange={(e) =>
                  update(
                    "jobdesk",
                    e.target.value
                  )
                }
              />

            </div>

            <div className="flex justify-end">

              <Button
                type="button"
                variant="destructive"
                onClick={onDelete}
              >
                <Trash2 className="mr-2 h-4 w-4" />

                Delete Experience

              </Button>

            </div>

          </CardContent>

        </Card>

      </AccordionContent>

    </AccordionItem>
  );
}