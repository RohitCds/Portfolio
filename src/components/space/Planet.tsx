import type { CSSProperties } from "react";
import { PlanetTheme, themeStyle } from "./planets";

export default function Planet({ theme, className = "", style }: { theme: PlanetTheme; className?: string; style?: CSSProperties }) {
  return (
    <div className={`relative ${className}`} style={{ ...themeStyle(theme), ...style }}>
      {theme.ring && <div className="planet-ring" />}
      <div className="planet-body" />
      {theme.ring && <div className="planet-ring front" />}
    </div>
  );
}
