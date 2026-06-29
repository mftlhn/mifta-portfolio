"use client";

import { Plus } from "lucide-react";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";

import { Accordion } from "@/components/ui/accordion";

import {
  ProjectItem,
} from "@/lib/portfolio-data";

import ProjectCard from "./ProjectCard";

type Props = {
  value: ProjectItem[];
  onChange: (value: ProjectItem[]) => void;
};

const emptyProject: ProjectItem = {
  name: "",
  description: "",
  stack: [],
  demoUrl: "",
  repoUrl: "",
  imageUrls: [],
};

export default function ProjectsForm({
  value,
  onChange,
}: Props) {

  const addProject = () => {
    onChange([
      ...value,
      {
        ...emptyProject,
      },
    ]);
  };

  const updateProject = (
    index: number,
    project: ProjectItem
  ) => {
    const newProjects = [...value];

    newProjects[index] = project;

    onChange(newProjects);
  };

  const removeProject = (
    index: number
  ) => {
    if (
      !window.confirm(
        "Delete this project?"
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
            Projects
          </CardTitle>

          <CardDescription>
            Manage your portfolio projects.
          </CardDescription>

        </div>

        <Button
          type="button"
          onClick={addProject}
        >
          <Plus className="mr-2 h-4 w-4" />

          Add Project

        </Button>

      </CardHeader>

      <CardContent>

        {value.length === 0 ? (
          <div className="rounded-lg border border-dashed p-10 text-center text-muted-foreground">

            No project yet.

          </div>
        ) : (
          <Accordion
            type="multiple"
            className="space-y-4"
          >

            {value.map(
              (
                project,
                index
              ) => (
                <ProjectCard
                  key={index}
                  index={index}
                  value={project}
                  onChange={(value) =>
                    updateProject(
                      index,
                      value
                    )
                  }
                  onDelete={() =>
                    removeProject(
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