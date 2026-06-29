"use client";

import { PortfolioContent } from "@/lib/portfolio-data";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

import { Input } from "@/components/ui/input";

import { Label } from "@/components/ui/label";

import { Textarea } from "@/components/ui/textarea";

import TagInput from "./TagInput";

type Props = {
  value: PortfolioContent;
  onChange: (value: PortfolioContent) => void;
};

export default function CmsProfileForm({
  value,
  onChange,
}: Props) {
  const updateField = <
    K extends keyof PortfolioContent
  >(
    key: K,
    fieldValue: PortfolioContent[K]
  ) => {
    onChange({
      ...value,
      [key]: fieldValue,
    });
  };

  return (
    <Card>

      <CardHeader>

        <CardTitle>
          General Information
        </CardTitle>

        <CardDescription>
          Basic information shown on your portfolio.
        </CardDescription>

      </CardHeader>

      <CardContent className="space-y-6">

        {/* Full Name */}

        <div className="space-y-2">

          <Label htmlFor="fullName">
            Full Name
          </Label>

          <Input
            id="fullName"
            value={value.fullName}
            onChange={(e) =>
              updateField(
                "fullName",
                e.target.value
              )
            }
          />

        </div>

        {/* Role */}

        <div className="space-y-2">

          <Label htmlFor="role">
            Role
          </Label>

          <Input
            id="role"
            value={value.role}
            onChange={(e) =>
              updateField(
                "role",
                e.target.value
              )
            }
          />

        </div>

        {/* Location */}

        <div className="space-y-2">

          <Label htmlFor="location">
            Location
          </Label>

          <Input
            id="location"
            value={value.location}
            onChange={(e) =>
              updateField(
                "location",
                e.target.value
              )
            }
          />

        </div>

        {/* Email */}

        <div className="space-y-2">

          <Label htmlFor="contactEmail">
            Contact Email
          </Label>

          <Input
            id="contactEmail"
            type="email"
            value={value.contactEmail}
            onChange={(e) =>
              updateField(
                "contactEmail",
                e.target.value
              )
            }
          />

        </div>

        {/* Summary */}

        <div className="space-y-2">

          <Label htmlFor="summary">
            Summary
          </Label>

          <Textarea
            id="summary"
            rows={6}
            value={value.summary}
            onChange={(e) =>
              updateField(
                "summary",
                e.target.value
              )
            }
          />

        </div>

        {/* Skills */}

        <TagInput
          label="Skills"
          placeholder="Laravel"
          description="Press Enter or click Add"
          value={value.skills}
          onChange={(skills) =>
            updateField(
              "skills",
              skills
            )
          }
        />

      </CardContent>

    </Card>
  );
}