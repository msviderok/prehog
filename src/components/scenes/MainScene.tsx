import { type ParentProps } from "solid-js";

export function MainScene(props: ParentProps<{}>) {
  return (
    <div
      class="relative shrink-0 overflow-hidden [image-rendering:pixelated]"
      style={{
        width: "6043px",
        height: "1080px",
        "background-color": "#111220",
        "background-image":
          'url("https://utfs.io/f/FRHd7GIa8Oy2N1cA4CqQ0oh8I3ZJzj1XcaRn6dE2kKOTlyuS")',
        "background-size": "100% 100%",
        "background-repeat": "no-repeat",
        "background-position": "center",
      }}
    >
      <div class="absolute inset-0"></div>
      {props.children}
    </div>
  );
}
