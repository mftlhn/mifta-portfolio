"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      className={cn("w-full", className)}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      className={cn(
        "border-b last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">

      <AccordionPrimitive.Trigger
        className={cn(
          "group flex flex-1 items-center justify-between py-4 text-left text-sm font-medium transition-all hover:no-underline",
          className
        )}
        {...props}
      >

        {children}

        <ChevronDown
          className="h-4 w-4 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180"
        />

      </AccordionPrimitive.Trigger>

    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      className={cn(
        "overflow-hidden",
        "data-[state=closed]:animate-accordion-up",
        "data-[state=open]:animate-accordion-down"
      )}
      {...props}
    >
      <div
        className={cn(
          "pb-4 pt-2",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
};