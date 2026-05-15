import type { SVGProps } from "react";

type IconName =
  | "dashboard"
  | "school"
  | "verify"
  | "report"
  | "overview"
  | "upload"
  | "users"
  | "guidance"
  | "profile"
  | "academic"
  | "result"
  | "roadmap"
  | "menu"
  | "logout"
  | "spark"
  | "check"
  | "user"
  | "target"
  | "clock"
  | "chart"
  | "book"
  | "shield"
  | "rocket"
  | "mail"
  | "phone"
  | "lock"
  | "chevronRight"
  | "home"
  | "briefcase"
  | "building"
  | "graduation"
  | "clipboard"
  | "x"
  | "alert";

type Props = SVGProps<SVGSVGElement> & {
  name: IconName;
};

export function Icon({ name, className = "h-5 w-5", ...props }: Props) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.9,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    ...props,
  };

  switch (name) {
    case "dashboard":
      return <svg {...common}><path d="M3 12.5 12 4l9 8.5"/><path d="M5 10.5V20h14v-9.5"/><path d="M9 20v-6h6v6"/></svg>;
    case "school":
      return <svg {...common}><path d="M3 9 12 4l9 5-9 5-9-5Z"/><path d="M5 10.5V18"/><path d="M19 10.5V18"/><path d="M8 12v6"/><path d="M12 14v4"/><path d="M16 12v6"/><path d="M4 20h16"/></svg>;
    case "verify":
      return <svg {...common}><path d="M12 3l7 3v5c0 4.5-2.8 8.4-7 10-4.2-1.6-7-5.5-7-10V6l7-3Z"/><path d="m9.2 11.8 1.9 1.9 3.9-4.1"/></svg>;
    case "report":
      return <svg {...common}><path d="M7 3h7l5 5v13H7z"/><path d="M14 3v5h5"/><path d="M10 13h6"/><path d="M10 17h4"/></svg>;
    case "overview":
      return <svg {...common}><rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="4" rx="1.5"/><rect x="14" y="11" width="7" height="9" rx="1.5"/><rect x="3" y="14" width="7" height="6" rx="1.5"/></svg>;
    case "upload":
      return <svg {...common}><path d="M12 16V5"/><path d="m8 9 4-4 4 4"/><path d="M4 17v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1"/></svg>;
    case "users":
      return <svg {...common}><path d="M16 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-3A4.5 4.5 0 0 0 4 19.5V21"/><circle cx="10" cy="8" r="3"/><path d="M17 11a3 3 0 1 0 0-6"/><path d="M20 21v-1a4 4 0 0 0-2.5-3.7"/></svg>;
    case "guidance":
      return <svg {...common}><path d="M12 21s-6-3.5-6-10a6 6 0 0 1 12 0c0 6.5-6 10-6 10Z"/><circle cx="12" cy="11" r="2.5"/></svg>;
    case "profile":
      return <svg {...common}><circle cx="12" cy="8" r="4"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>;
    case "academic":
      return <svg {...common}><path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"/><path d="M7 11v4.2c0 1.6 2.2 2.8 5 2.8s5-1.2 5-2.8V11"/><path d="M21 8.5v5.5"/></svg>;
    case "result":
      return <svg {...common}><path d="M5 19V9"/><path d="M12 19V5"/><path d="M19 19v-7"/></svg>;
    case "roadmap":
      return <svg {...common}><path d="M6 19a3 3 0 1 1 0-6h7a3 3 0 1 0 0-6h-2"/><circle cx="6" cy="16" r="1.5"/><circle cx="13" cy="10" r="1.5"/><circle cx="18" cy="7" r="1.5"/></svg>;
    case "menu":
      return <svg {...common}><path d="M4 7h16"/><path d="M4 12h16"/><path d="M4 17h16"/></svg>;
    case "logout":
      return <svg {...common}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/></svg>;
    case "spark":
      return <svg {...common}><path d="m12 3 1.4 4.6L18 9l-4.6 1.4L12 15l-1.4-4.6L6 9l4.6-1.4L12 3Z"/><path d="m5 17 .7 2.3L8 20l-2.3.7L5 23l-.7-2.3L2 20l2.3-.7L5 17Z"/><path d="m19 14 .7 2.3L22 17l-2.3.7L19 20l-.7-2.3L16 17l2.3-.7L19 14Z"/></svg>;
    case "check":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="m8.5 12.3 2.2 2.2 4.8-5"/></svg>;
    case "user":
      return <svg {...common}><circle cx="12" cy="8" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>;
    case "target":
      return <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/><circle cx="12" cy="12" r="1.2"/></svg>;
    case "clock":
      return <svg {...common}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case "chart":
      return <svg {...common}><path d="M4 19h16"/><path d="M7 16V9"/><path d="M12 16V5"/><path d="M17 16v-4"/></svg>;
    case "book":
      return <svg {...common}><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H19v18H7.5A2.5 2.5 0 0 0 5 22"/><path d="M5 4.5V22"/></svg>;
    case "shield":
      return <svg {...common}><path d="M12 3l7 3v5c0 4.5-2.8 8.4-7 10-4.2-1.6-7-5.5-7-10V6l7-3Z"/></svg>;
    case "rocket":
      return <svg {...common}><path d="M5 19c2.5-1 4-2.5 5-5 3.5-.2 6.3-3.1 6.5-6.5 0 0 1-2.6 1-4.5-1.9 0-4.5 1-4.5 1C9.6 4.2 6.7 7 6.5 10.5c-2.5 1-4 2.5-5 5 1.8.1 3.2-.1 3.2-.1S4.9 16.8 5 19Z"/><path d="M9 15l-2.5 2.5"/><circle cx="14.5" cy="8.5" r="1.2"/></svg>;
    case "mail":
      return <svg {...common}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m4 7 8 6 8-6"/></svg>;
    case "phone":
      return <svg {...common}><path d="M6.7 3.8 9.5 3a1 1 0 0 1 1.2.6l1.3 3.1a1 1 0 0 1-.3 1.2l-1.6 1.3a14 14 0 0 0 4.5 4.5l1.3-1.6a1 1 0 0 1 1.2-.3l3.1 1.3a1 1 0 0 1 .6 1.2l-.8 2.8A2 2 0 0 1 18 21C9.7 21 3 14.3 3 6a2 2 0 0 1 1.5-2.2Z"/></svg>;
    case "lock":
      return <svg {...common}><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 1 1 8 0v3"/></svg>;
    case "chevronRight":
      return <svg {...common}><path d="m9 6 6 6-6 6"/></svg>;
    case "home":
      return <svg {...common}><path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V20h14v-9.5"/></svg>;
    case "briefcase":
      return <svg {...common}><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/></svg>;
    case "building":
      return <svg {...common}><path d="M4 21V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v16"/><path d="M8 7h2"/><path d="M8 11h2"/><path d="M8 15h2"/><path d="M14 9h6v12h-6"/><path d="M16 13h2"/><path d="M16 17h2"/><path d="M3 21h18"/></svg>;
    case "graduation":
      return <svg {...common}><path d="M3 8.5 12 4l9 4.5-9 4.5-9-4.5Z"/><path d="M7 11v4.2c0 1.6 2.2 2.8 5 2.8s5-1.2 5-2.8V11"/><path d="M21 8.5v5.5"/></svg>;
    case "clipboard":
      return <svg {...common}><rect x="6" y="4" width="12" height="17" rx="2"/><path d="M9 4.5h6"/><path d="M9 9h6"/><path d="M9 13h6"/></svg>;

    case "x":
      return <svg {...common}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>;
    case "alert":
      return <svg {...common}><path d="M12 9v4"/><path d="M12 17h.01"/><path d="M10.3 4.4 2.8 17.2A2 2 0 0 0 4.5 20h15a2 2 0 0 0 1.7-2.8L13.7 4.4a2 2 0 0 0-3.4 0Z"/></svg>;
    default:
      return <svg {...common}><circle cx="12" cy="12" r="9"/></svg>;
  }
}
