import type { CSSProperties } from "react";

import styles from "./FloatingPlatform.module.css";

type FloatingPlatformProps = {
  className?: string;
  style?: CSSProperties;
};

export function FloatingPlatform({ className, style }: FloatingPlatformProps) {
  return (
    <div
      className={[styles.wrapper, className].filter(Boolean).join(" ")}
      style={style}
    >
      <span aria-hidden="true" className={styles.shadowSoft} />
      <span aria-hidden="true" className={styles.shadowMain} />
      <span aria-hidden="true" className={styles.shadowContact} />
      <img
        alt=""
        aria-hidden="true"
        className={styles.board}
        draggable={false}
        src="/third-screen-v2/platform-v2.png"
      />
    </div>
  );
}

export default FloatingPlatform;
