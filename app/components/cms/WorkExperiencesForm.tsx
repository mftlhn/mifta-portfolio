"use client";

import { Plus } from "lucide-react";

import {
  Accordion,
} from "@/components/ui/accordion";

import {
  Button,
} from "@/components/ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  WorkExperienceItem,
} from "@/lib/portfolio-data";

import WorkExperienceCard from "./WorkExperienceCard";

type Props = {
  value: WorkExperienceItem[];
  onChange: (value: WorkExperienceItem[]) => void;
};

const emptyExperience: WorkExperienceItem = {
  companyName: "",
  yearRange: "",
  position: "",
  jobdesk: "",
};

export default function WorkExperiencesForm({
  value,
  onChange,
}: Props) {
  const addExperience = () => {
    onChange([
      ...value,
      {
        ...emptyExperience,
      },
    ]);
  };

  const updateExperience = (
    index: number,
    experience: WorkExperienceItem
  ) => {
    const newExperiences = [...value];

    newExperiences[index] = experience;

    onChange(newExperiences);
  };

  const removeExperience = (
    index: number
  ) => {
    if (
      !window.confirm(
        "Delete this work experience?"
      )
    ) {
      return;
    }

    onChange(
      value.filter(
        (_, i) => i !== index
      )
    );
  };

  return (
    <Card>

      <CardHeader className="flex flex-row items-center justify-between">

        <div>

          <CardTitle>
            Work Experiences
          </CardTitle>

          <CardDescription>
            Manage your work experiences.
          </CardDescription>

        </div>

        <Button
          type="button"
          onClick={addExperience}
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Experience

        </Button>

      </CardHeader>

      <CardContent>

        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">

            No work experience yet.

          </div>
        ) : (
          <Accordion
            type="multiple"
            className="space-y-4"
          >
            {value.map(
              (
                experience,
                index
              ) => (
                <WorkExperienceCard
                  key={index}
                  index={index}
                  value={experience}
                  onChange={(value) =>
                    updateExperience(
                      index,
                      value
                    )
                  }
                  onDelete={() =>
                    removeExperience(
                      index
                    )
                  }
                />
              )
            )}
          </Accordion>
        )}

      </CardContent>

    </Card>
  );
}