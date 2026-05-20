"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
} from "react";

import styles from "@/components/ContactSection.module.css";

const DESIGN_W = 1699;
const DESIGN_H = 674.9;
const TRANSITION_SVH = 40;
const FINAL_BLUE_SVH = 15;
const BLUE_RANGE_SVH = TRANSITION_SVH - FINAL_BLUE_SVH;
const ENTRY_START_SVH = 100 - TRANSITION_SVH;
const CONTACT_MARQUEE_REPEATS = 4;
const CONTACT_MAGNET_MAX_OFFSET = 15;
const contactMarqueeItems = Array.from(
  { length: CONTACT_MARQUEE_REPEATS },
  (_, index) => index,
);

const contactItems = [
  {
    accent: "#03DF6D",
    className: styles.wechatIcon,
    copyFeedback: "已复制",
    copyHintLeft: "542px",
    copyLabel: "微信号",
    copyValue: "hu17665444674",
    label: "WeChat",
    src: "/assets/contact/wechat.svg",
  },
  {
    accent: "#F19252",
    className: styles.phoneIcon,
    copyFeedback: "已复制",
    copyHintLeft: "754px",
    copyLabel: "电话",
    copyValue: "17665444674",
    label: "Phone",
    src: "/assets/contact/phone.svg",
  },
  {
    accent: "#6FA9E7",
    className: styles.emailIcon,
    copyFeedback: "已复制",
    copyHintLeft: "966px",
    copyLabel: "邮箱",
    copyValue: "1047885003@qq.com",
    label: "Email",
    src: "/assets/contact/email.svg",
  },
] as const;

function clamp(value: number, min = 0, max = 1) {
  return Math.min(Math.max(value, min), max);
}

function handleContactActionMouseMove(event: ReactMouseEvent<HTMLLIElement>) {
  const target = event.currentTarget;
  const rect = target.getBoundingClientRect();
  const x =
    clamp((event.clientX - rect.left - rect.width / 2) / (rect.width / 2), -1, 1) *
    CONTACT_MAGNET_MAX_OFFSET;
  const y =
    clamp(
      (event.clientY - rect.top - rect.height / 2) / (rect.height / 2),
      -1,
      1,
    ) * CONTACT_MAGNET_MAX_OFFSET;

  target.style.setProperty("--contact-magnet-duration", "120ms");
  target.style.setProperty("--contact-magnet-x", `${x.toFixed(2)}px`);
  target.style.setProperty("--contact-magnet-y", `${y.toFixed(2)}px`);
}

function resetContactActionMagnet(event: ReactMouseEvent<HTMLLIElement>) {
  const target = event.currentTarget;

  target.style.setProperty("--contact-magnet-duration", "420ms");
  target.style.setProperty("--contact-magnet-x", "0px");
  target.style.setProperty("--contact-magnet-y", "0px");
}

function preventContactActionFocus(event: ReactMouseEvent<HTMLLIElement>) {
  event.preventDefault();
}

export function ContactSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const copyResetRef = useRef<number | null>(null);
  const [copiedContact, setCopiedContact] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  useEffect(() => {
    const section = sectionRef.current;

    if (!section) {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    let scheduled = false;

    const getEntryDistance = () =>
      window.innerHeight * (ENTRY_START_SVH / 100);

    const scrollToContactEnd = () => {
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      window.scrollTo({
        top: sectionTop,
        behavior: "auto",
      });
      update();
    };

    const scheduleContactEndScroll = () => {
      window.requestAnimationFrame(scrollToContactEnd);
      window.setTimeout(scrollToContactEnd, 80);
      window.setTimeout(scrollToContactEnd, 240);
    };

    const update = () => {
      scheduled = false;
      const viewportHeight = window.innerHeight;
      const finalContactHeight = viewportHeight * (FINAL_BLUE_SVH / 100);
      const scale = Math.min(
        window.innerWidth / DESIGN_W,
        (viewportHeight - finalContactHeight) / DESIGN_H,
      );
      const entryDistance = getEntryDistance();
      const rect = section.getBoundingClientRect();
      const progress = mediaQuery.matches
        ? 1
        : clamp((entryDistance - rect.top) / Math.max(1, entryDistance));
      const blueHeight = TRANSITION_SVH - BLUE_RANGE_SVH * progress;

      section.style.setProperty(
        "--contact-blue-height",
        `${blueHeight.toFixed(3)}svh`,
      );
      section.style.setProperty("--contact-scale", scale.toString());
    };

    const scheduleUpdate = () => {
      if (scheduled) {
        return;
      }

      scheduled = true;
      window.requestAnimationFrame(update);
    };

    const syncContactHashTarget = () => {
      if (window.location.hash !== "#contact") {
        return;
      }

      scheduleContactEndScroll();
      scheduleUpdate();
    };

    const handleContactNavClick = (event: MouseEvent) => {
      const target = event.target;

      if (!(target instanceof Element)) {
        return;
      }

      const link = target.closest<HTMLAnchorElement>('a[href="#contact"]');

      if (!link) {
        return;
      }

      event.preventDefault();
      window.history.pushState(null, "", "#contact");
      scheduleContactEndScroll();
    };

    const tick = () => {
      update();
      frameRef.current = window.requestAnimationFrame(tick);
    };

    tick();
    syncContactHashTarget();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("hashchange", syncContactHashTarget);
    document.addEventListener("click", handleContactNavClick);
    mediaQuery.addEventListener("change", scheduleUpdate);

    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("hashchange", syncContactHashTarget);
      document.removeEventListener("click", handleContactNavClick);
      mediaQuery.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (copyResetRef.current !== null) {
        window.clearTimeout(copyResetRef.current);
      }
    };
  }, []);

  const showCopyFeedback = (label: string, feedback: string) => {
    if (copyResetRef.current !== null) {
      window.clearTimeout(copyResetRef.current);
    }

    setCopiedContact(label);
    setCopyFeedback(feedback);
    copyResetRef.current = window.setTimeout(() => {
      setCopiedContact(null);
      setCopyFeedback(null);
      copyResetRef.current = null;
    }, 2000);
  };

  const handleContactActionClick = async (
    item: (typeof contactItems)[number],
  ) => {
    if (!("copyValue" in item)) {
      return;
    }

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard unavailable");
      }

      await navigator.clipboard.writeText(item.copyValue);
      showCopyFeedback(item.label, item.copyFeedback);
    } catch {
      showCopyFeedback(item.label, `请手动复制：${item.copyValue}`);
    }
  };

  const handleContactActionKeyDown = (
    event: ReactKeyboardEvent<HTMLLIElement>,
    item: (typeof contactItems)[number],
  ) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    event.preventDefault();
    void handleContactActionClick(item);
  };
  return (
    <section
      aria-label="Contact"
      className={styles.contactSection}
      ref={sectionRef}
    >
      <div className={styles.contactStage}>
        <div
          aria-hidden="true"
          className={styles.contactBlueLayer}
          data-logo-theme="light"
        />

        <div className={styles.contactViewport}>
          <div className={styles.contactCanvas}>
            <h2 className={styles.contactTitle}>
              The next step can start with
              <br />a single conversation.
            </h2>

            <ul className={styles.contactActions} aria-label="Contact methods">
              {contactItems.map((item) => {
                const isCopied = copiedContact === item.label;

                return (
                  <li
                    aria-label={`复制${item.copyLabel}`}
                    className={`${styles.contactAction} ${item.className} ${
                      isCopied ? styles.contactActionCopied : ""
                    }`}
                    key={item.label}
                    onClick={() => {
                      void handleContactActionClick(item);
                    }}
                    onKeyDown={(event) =>
                      handleContactActionKeyDown(event, item)
                    }
                    onMouseEnter={handleContactActionMouseMove}
                    onMouseLeave={resetContactActionMagnet}
                    onMouseDown={preventContactActionFocus}
                    onMouseMove={handleContactActionMouseMove}
                    role="button"
                    style={
                      {
                        "--contact-action-accent": item.accent,
                      } as CSSProperties
                    }
                    tabIndex={0}
                  >
                    <span className={styles.contactActionIconWrap}>
                      <img
                        alt={item.label}
                        className={`${styles.contactActionIcon} ${styles.contactActionIconBase}`}
                        decoding="async"
                        draggable={false}
                        loading="lazy"
                        src={item.src}
                      />
                      <img
                        alt=""
                        aria-hidden="true"
                        className={`${styles.contactActionIcon} ${styles.contactActionIconFill}`}
                        decoding="async"
                        draggable={false}
                        loading="lazy"
                        src={item.src}
                      />
                      <span
                        aria-hidden="true"
                        className={styles.contactActionCheckIcon}
                      >
                        <svg
                          fill="none"
                          viewBox="0 0 48 48"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M13 24.5L21 32L36 16"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="6"
                          />
                        </svg>
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>

            <div aria-live="polite" className={styles.contactCopiedHints}>
              {contactItems.map((item) => {
                const isCopied = copiedContact === item.label;

                return (
                  <p
                    className={`${styles.contactCopiedHint} ${
                      isCopied ? styles.contactCopiedHintVisible : ""
                    }`}
                    key={`${item.label}-copy-feedback`}
                    style={
                      {
                        "--contact-copy-hint-left": item.copyHintLeft,
                      } as CSSProperties
                    }
                  >
                    {isCopied ? copyFeedback : ""}
                  </p>
                );
              })}
            </div>

            <div aria-hidden="true" className={styles.contactBand}>
              <div className={styles.contactMarqueeTrack}>
                {[0, 1].map((group) => (
                  <div className={styles.contactMarqueeGroup} key={group}>
                    {contactMarqueeItems.map((item) => (
                      <span
                        className={styles.contactMarqueeText}
                        key={`${group}-${item}`}
                      >
                        CONTACT ME
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.contactFooter}>
              <p className={styles.contactFooterLeft}>
                PRODUCT THINKING&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;AI APPLICATION WORKFLOW
              </p>
              <p className={styles.contactFooterRight}>
                &copy;2026 BENJI. ALL RIGHTS RESERVED
              </p>
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className={styles.contactAnchor} id="contact" />
    </section>
  );
}

export default ContactSection;
