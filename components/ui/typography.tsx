import { cn } from "@/lib/utils";
import React from "react";

// Heading Components
interface HeadingProps extends React.HTMLAttributes<HTMLHeadingElement> {
  variant?: "default" | "display";
}

export function H1({
  className,
  children,
  variant = "default",
  ...props
}: HeadingProps) {
  return (
    <h1
      className={cn(
        variant === "display"
          ? "text-4xl md:text-6xl font-bold tracking-widest uppercase"
          : "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
        className
      )}
      {...props}
    >
      {children}
    </h1>
  );
}

export function H2({
  className,
  children,
  variant = "default",
  ...props
}: HeadingProps) {
  return (
    <h2
      className={cn(
        variant === "display"
          ? "text-2xl font-bold tracking-widest uppercase"
          : "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
}

export function H3({
  className,
  children,
  variant = "default",
  ...props
}: HeadingProps) {
  return (
    <h3
      className={cn(
        variant === "display"
          ? "text-xl font-bold tracking-widest uppercase"
          : "scroll-m-20 text-2xl font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
}

export function H4({
  className,
  children,
  variant = "default",
  ...props
}: HeadingProps) {
  return (
    <h4
      className={cn(
        variant === "display"
          ? "text-lg font-bold tracking-wider uppercase"
          : "scroll-m-20 text-xl font-semibold tracking-tight",
        className
      )}
      {...props}
    >
      {children}
    </h4>
  );
}

// Body Text Components
export function P({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "leading-7 [&:not(:first-child)]:mt-6",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Lead({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-xl text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

export function Large({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "text-lg font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function Small({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <small
      className={cn(
        "text-sm font-medium leading-none",
        className
      )}
      {...props}
    >
      {children}
    </small>
  );
}

export function Muted({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn(
        "text-sm text-muted-foreground",
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
}

// Special Elements
export function Blockquote({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLQuoteElement>) {
  return (
    <blockquote
      className={cn(
        "mt-6 border-l-2 pl-6 italic",
        className
      )}
      {...props}
    >
      {children}
    </blockquote>
  );
}

export function InlineCode({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  return (
    <code
      className={cn(
        "relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
}

export function List({
  className,
  children,
  ordered = false,
  ...props
}: React.HTMLAttributes<HTMLUListElement | HTMLOListElement> & {
  ordered?: boolean
}) {
  const Component = ordered ? "ol" : "ul";
  return (
    <Component
      className={cn(
        "my-6 ml-6 [&>li]:mt-2",
        ordered ? "list-decimal" : "list-disc",
        className
      )}
      {...props}
    >
      {children}
    </Component>
  );
}
