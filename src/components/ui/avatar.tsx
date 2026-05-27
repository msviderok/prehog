import { cn } from "@/lib/utils";
import { Avatar as AvatarPrimitive } from "@msviderok/base-ui-solid/avatar";
import { ClientOnly } from "@tanstack/solid-router";
import { createMemo, splitProps, type ComponentProps } from "solid-js";
import type { Doc } from "../../../convex/_generated/dataModel";

function Avatar(props: { user: Doc<"users"> }) {
  const getUserFallback = createMemo(() => {
    const [firstname, lastname] = props.user.fullname.split(" ");
    return `${firstname[0]}${lastname[0]}`;
  });

  return (
    <ClientOnly>
      <AvatarPrimitive.Root
        data-slot="avatar"
        data-size="sm"
        class={cn(
          "group/avatar relative flex size-7 shrink-0 rounded-full outline-2 outline-border",
        )}
      >
        <AvatarImage src={props.user.avatar} />
        <AvatarFallback>{getUserFallback()}</AvatarFallback>
        <AvatarBadge
          class={cn(
            "opacity-0",
            props.user.isOnline && "opacity-100 bg-green-600 border-green-800",
          )}
        />
      </AvatarPrimitive.Root>
    </ClientOnly>
  );
}

function AvatarImage(props: AvatarPrimitive.Image.Props) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      class={cn("aspect-square size-full rounded-full object-cover", local.class)}
      {...rest}
    />
  );
}

function AvatarFallback(props: AvatarPrimitive.Fallback.Props) {
  const [local, rest] = splitProps(props, ["class"]);

  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      class={cn(
        "flex size-full items-center justify-center rounded-full bg-muted text-sm text-muted-foreground group-data-[size=sm]/avatar:text-xs",
        local.class,
      )}
      {...rest}
    />
  );
}

function AvatarBadge(props: ComponentProps<"span">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <span
      data-slot="avatar-badge"
      class={cn(
        "absolute right-0 bottom-0 z-10 inline-flex items-center justify-center rounded-full bg-primary text-primary-foreground bg-blend-color ring-2 ring-background select-none",
        "group-data-[size=sm]/avatar:size-2 group-data-[size=sm]/avatar:[&>svg]:hidden",
        "group-data-[size=default]/avatar:size-2.5 group-data-[size=default]/avatar:[&>svg]:size-2",
        "group-data-[size=lg]/avatar:size-3 group-data-[size=lg]/avatar:[&>svg]:size-2",
        local.class,
      )}
      {...rest}
    />
  );
}

function AvatarGroup(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="avatar-group"
      class={cn(
        "group/avatar-group flex -space-x-2 *:data-[slot=avatar]:ring-2 *:data-[slot=avatar]:ring-background",
        local.class,
      )}
      {...rest}
    />
  );
}

function AvatarGroupCount(props: ComponentProps<"div">) {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <div
      data-slot="avatar-group-count"
      class={cn(
        "relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs/relaxed text-muted-foreground ring-2 ring-background group-has-data-[size=lg]/avatar-group:size-10 group-has-data-[size=sm]/avatar-group:size-6 [&>svg]:size-4 group-has-data-[size=lg]/avatar-group:[&>svg]:size-5 group-has-data-[size=sm]/avatar-group:[&>svg]:size-3",
        local.class,
      )}
      {...rest}
    />
  );
}

export { Avatar };
