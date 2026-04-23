"use client";

import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { MorphingText } from "@/components/ui/morphing-text";
import { memo } from "react";
import { useEffect, useState } from "react";

const navItems = [
  { label: "影响者", href: "#influencer" },
  { label: "代码", href: "#code" },
  { label: "游戏", href: "#game" },
  { label: "音乐", href: "#music" },
  { label: "图书", href: "#books" },
];

const identityLines = [
  "复杂业务拆解",
  "多端系统梳理",
  "产品原型设计",
  "落地验收迭代",
  "跨角色协同推进",
  "AI Agent 工作流",
];

const titleWords = ["Benji", "产品经理"];

const topOrbitIcon = "/gpt-logo.png";
const rightOrbitIcon = "/figma-logo.png";
const bottomOrbitIcon = "/gemini-logo.png";
const leftOrbitIcon = null;

type IconProps = {
  className?: string;
};

function FavoriteIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 416 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M272 96c26.51 0 48-21.49 48-48S298.51 0 272 0s-48 21.49-48 48 21.49 48 48 48zM113.69 317.47l-14.8 34.52H32c-17.67 0-32 14.33-32 32s14.33 32 32 32h77.45c19.25 0 36.58-11.44 44.11-29.09l8.79-20.52-10.67-6.3c-17.32-10.23-30.06-25.37-37.99-42.61zM384 223.99h-44.03l-26.06-53.25c-12.5-25.55-35.45-44.23-61.78-50.94l-71.08-21.14c-28.3-6.8-57.77-.55-80.84 17.14l-39.67 30.41c-14.03 10.75-16.69 30.83-5.92 44.86s30.84 16.66 44.86 5.92l39.69-30.41c7.67-5.89 17.44-8 25.27-6.14l14.7 4.37-37.46 87.39c-12.62 29.48-1.31 64.01 26.3 80.31l84.98 50.17-27.47 87.73c-5.28 16.86 4.11 34.81 20.97 40.09 3.19 1 6.41 1.48 9.58 1.48 13.61 0 26.23-8.77 30.52-22.45l31.64-101.06c5.91-20.77-2.89-43.08-21.64-54.39l-61.24-36.14 31.31-78.28 20.27 41.43c8 16.34 24.92 26.89 43.11 26.89H384c17.67 0 32-14.33 32-32s-14.33-31.99-32-31.99z"
      />
    </svg>
  );
}

function GitHubIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 496 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-27-.3-52.9-69 15-83.5-29.6-83.5-29.6-11.3-28.8-27.6-36.5-27.6-36.5-22.6-15.4 1.7-15.1 1.7-15.1 25 1.8 38.1 25.7 38.1 25.7 22.2 38 58.3 27 72.5 20.7 2.2-16.1 8.7-27 15.8-33.2-55.1-6.3-113-27.5-113-122.6 0-27.1 9.7-49.2 25.6-66.6-2.6-6.3-11.1-31.6 2.4-65.7 0 0 20.9-6.7 68.5 25.4 19.9-5.5 41.2-8.3 62.4-8.4 21.2.1 42.5 2.9 62.4 8.4 47.6-32.1 68.5-25.4 68.5-25.4 13.5 34.1 5 59.4 2.4 65.7 15.9 17.4 25.5 39.5 25.5 66.6 0 95.3-58 116.2-113.3 122.4 8.9 7.7 16.8 22.8 16.8 45.9 0 33.2-.3 59.9-.3 68.1 0 6.6 4.4 14.4 17.4 11.9C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"
      />
    </svg>
  );
}

function TwitterIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M459.37 151.716c.325 4.548.325 9.097.325 13.645 0 138.72-105.583 298.558-298.558 298.558-59.452 0-114.68-17.219-161.137-47.106 8.447.974 16.568 1.299 25.34 1.299 49.055 0 94.213-16.568 130.274-44.832-46.132-.975-84.792-31.188-98.112-72.772 6.498.974 12.995 1.624 19.818 1.624 9.421 0 18.843-1.3 27.614-3.573-48.081-9.747-84.143-51.98-84.143-102.985v-1.299c13.969 7.797 30.214 12.67 47.431 13.319-28.264-18.843-46.781-51.005-46.781-87.391 0-19.492 5.197-37.36 14.294-52.954 51.655 63.675 129.3 105.258 216.365 109.807-1.624-7.797-2.599-15.918-2.599-24.04 0-57.828 46.782-104.934 104.934-104.934 30.214 0 57.502 12.67 76.67 33.137 23.715-4.548 46.456-13.32 66.599-25.34-7.798 24.366-24.366 44.833-46.132 57.827 21.117-2.273 41.584-8.122 60.426-16.243-14.292 20.791-32.161 39.308-52.628 54.253z"
      />
    </svg>
  );
}

function TvIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 640 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M592 64H384.5L441 7.5 418.5-15 320 83.5 221.5-15 199 7.5 255.5 64H48C21.5 64 0 85.5 0 112v304c0 26.5 21.5 48 48 48h544c26.5 0 48-21.5 48-48V112c0-26.5-21.5-48-48-48zM112 160h416v208H112V160zm48 56v96h64v-96h-64zm128 0v96h64v-96h-64zm128 0v96h64v-96h-64z"
      />
    </svg>
  );
}

function InstagramIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 448 512" aria-hidden="true">
      <path
        fill="currentColor"
        d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9S160.5 370.8 224.1 370.8 339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9S352.4 35.1 316.5 33.4c-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1S3.2 127.6 1.5 163.5c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.5 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2s34.5-58 36.2-93.9c2.1-37 2.1-147.8 0-184.9zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"
      />
    </svg>
  );
}

function EthereumIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 256 417" aria-hidden="true">
      <path fill="#343434" d="M127.9 0 125.1 9.5v275.3l2.8 2.8 127.8-75.5z" />
      <path fill="#8c8c8c" d="M127.9 0 0 212.1l127.9 75.5V154.1z" />
      <path fill="#3c3c3b" d="m127.9 311.8-1.6 2v98.1l1.6 4.7L256 236.3z" />
      <path fill="#8c8c8c" d="M127.9 416.6V311.8L0 236.3z" />
      <path fill="#141414" d="m127.9 287.6 127.8-75.5-127.8-58z" />
      <path fill="#393939" d="m0 212.1 127.9 75.5v-133.5z" />
    </svg>
  );
}

function ChromeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" aria-hidden="true">
      <circle cx="256" cy="256" r="256" fill="#f5f5f5" />
      <path fill="#db4437" d="M256 0h.6C351 0 433.6 51.5 477.8 128H256c-47.2 0-87.9 25.5-109.9 63.2L65.6 51.7C112.4 19.2 168.9 0 256 0z" />
      <path fill="#f4b400" d="M477.8 128A255 255 0 0 1 512 256c0 141.4-114.6 256-256 256l109.1-190.4C377.4 302.4 384 279.1 384 256c0-47.2-25.5-87.9-63.2-109.9z" />
      <path fill="#0f9d58" d="M365.1 321.6 256 512C114.6 512 0 397.4 0 256c0-46.6 12.5-90.4 34.3-128.9l109.8 191.2C166 357.5 207.9 384 256 384c46.6 0 87.5-24.8 109.1-62.4z" />
      <path fill="#4285f4" d="M256 344a88 88 0 1 0 0-176 88 88 0 0 0 0 176z" />
      <circle cx="256" cy="256" r="54" fill="#fff" opacity=".75" />
    </svg>
  );
}

function EdgeIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" aria-hidden="true">
      <rect width="512" height="512" fill="#000" rx="0" />
      <path
        fill="#84c8b5"
        d="M247.9 44.6c37.2 0 69.3 21.5 84.7 52.8 33.5-9.2 70.9.1 96.9 26.1 26.4 26.4 35.6 64.6 25.7 98.5 31.8 15.2 54 47.6 54 85.2 0 37.2-21.5 69.3-52.8 84.7 9.2 33.5-.1 70.9-26.1 96.9-26.4 26.4-64.6 35.6-98.5 25.7-15.2 31.8-47.6 54-85.2 54-37.2 0-69.3-21.5-84.7-52.8-33.5 9.2-70.9-.1-96.9-26.1-26.4-26.4-35.6-64.6-25.7-98.5C7.5 375.9-14.7 343.5-14.7 305.9c0-37.2 21.5-69.3 52.8-84.7-9.2-33.5.1-70.9 26.1-96.9 26.4-26.4 64.6-35.6 98.5-25.7 15.2-31.8 47.6-54 85.2-54Zm0 44.2c-25.4 0-47.6 14.5-58.4 35.7l-5.9 11.6-12.4-4c-24.1-7.7-51.6-1.6-70.1 16.9-18.2 18.2-24.5 45-17.3 68.8l3.8 12.6-11.8 5.8c-21.9 10.7-36.3 32.7-36.3 58 0 25.4 14.5 47.6 35.7 58.4l11.6 5.9-4 12.4c-7.7 24.1-1.6 51.6 16.9 70.1 18.2 18.2 45 24.5 68.8 17.3l12.6-3.8 5.8 11.8c10.7 21.9 32.7 36.3 58 36.3 25.4 0 47.6-14.5 58.4-35.7l5.9-11.6 12.4 4c24.1 7.7 51.6 1.6 70.1-16.9 18.2-18.2 24.5-45 17.3-68.8l-3.8-12.6 11.8-5.8c21.9-10.7 36.3-32.7 36.3-58 0-25.4-14.5-47.6-35.7-58.4l-11.6-5.9 4-12.4c7.7-24.1 1.6-51.6-16.9-70.1-18.2-18.2-45-24.5-68.8-17.3l-12.6 3.8-5.8-11.8c-10.7-21.9-32.7-36.3-58-36.3Z"
      />
      <path
        fill="#84c8b5"
        d="M159.4 162.1 256 106.3l96.6 55.8v72.6l-40.4-23.3v-26l-56.2-32.5-56.2 32.5v65l56.2 32.5 18.1-10.4v46.6L256 329.5l-96.6-55.8v-111.6Zm137.2 81.5 96.6 55.8v111.6L296.6 466l-96.6-55.8v-72.6l40.4 23.3v26l56.2 32.5 56.2-32.5v-65l-56.2-32.5-18.1 10.4v-46.6l18.1-10.4Zm-168 121.5 96.6 55.8v46.6l-137-79.1V276.8l40.4 23.3v65Zm254.8-218.2-96.6-55.8V44.5l137 79.1v111.6l-40.4-23.3v-65Z"
      />
    </svg>
  );
}

function FigmaIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 256 384" aria-hidden="true">
      <path fill="#0ACF83" d="M64 384c35.3 0 64-28.7 64-64v-64H64a64 64 0 1 0 0 128Z" />
      <path fill="#A259FF" d="M0 192a64 64 0 0 1 64-64h64v128H64a64 64 0 0 1-64-64Z" />
      <path fill="#F24E1E" d="M0 64A64 64 0 0 1 64 0h64v128H64A64 64 0 0 1 0 64Z" />
      <path fill="#FF7262" d="M128 0h64a64 64 0 0 1 0 128h-64V0Z" />
      <path fill="#1ABCFE" d="M256 192a64 64 0 1 1-128 0 64 64 0 0 1 128 0Z" />
    </svg>
  );
}

function GeminiIcon({ className }: IconProps) {
  return (
    <svg className={className} viewBox="0 0 512 512" aria-hidden="true">
      <defs>
        <linearGradient id="geminiA" x1="86" x2="426" y1="426" y2="86">
          <stop stopColor="#7C3AED" />
          <stop offset=".48" stopColor="#4F8DF7" />
          <stop offset="1" stopColor="#8BD8FF" />
        </linearGradient>
      </defs>
      <path
        fill="url(#geminiA)"
        d="M256 28c20.8 118.9 108.1 206.2 228 228-119.9 21.8-207.2 109.1-228 228-21.8-118.9-109.1-206.2-228-228 118.9-21.8 206.2-109.1 228-228Z"
      />
    </svg>
  );
}

function OrbitIconImage({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    <img
      alt=""
      className={className}
      draggable={false}
      src={src}
    />
  );
}

function TopNav() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full border-b border-slate-300/10 bg-gradient-to-b from-slate-100/95 to-slate-100/0 px-4 py-4 backdrop-blur-[2px] lg:px-16 xl:px-32 2xl:px-44">
      <div className="flex items-center justify-between">
        <nav className="flex items-center justify-start gap-x-12 text-lg text-slate-700">
          <a
            className="hidden font-coda text-2xl font-normal lg:block"
            href="#home"
          >
            Benji
          </a>
          <a
            className="hidden items-center gap-x-1 lg:flex"
            href="https://www.qzq.at/favorites"
          >
            <FavoriteIcon className="h-[1em] w-[1em]" />
            收藏夹
          </a>
          {navItems.map((item) => (
            <a className="hidden lg:block" href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center justify-start gap-x-4 text-2xl text-slate-700">
          <a aria-label="GitHub" href="https://github.com/SamuelQZQ">
            <GitHubIcon className="h-7 w-7" />
          </a>
          <a aria-label="Twitter" href="https://twitter.com/SamuelQZQ">
            <TwitterIcon className="h-7 w-7" />
          </a>
          <a aria-label="Bilibili" href="https://space.bilibili.com/">
            <TvIcon className="h-7 w-7" />
          </a>
          <a aria-label="Instagram" href="https://www.instagram.com/">
            <InstagramIcon className="h-7 w-7" />
          </a>
        </div>
      </div>
    </header>
  );
}

function OrbitBackground() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[373px] z-0 h-0 w-0">
      <svg className="absolute -left-[400px] -top-[400px] h-[800px] w-[800px] overflow-visible">
        <circle
          cx="400"
          cy="400"
          r="300"
          fill="none"
          stroke="#777"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
        <circle
          cx="400"
          cy="400"
          r="350"
          fill="none"
          stroke="#CACACA"
          strokeDasharray="4 4"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}

function OrbitElements() {
  return (
    <div className="pointer-events-none absolute left-1/2 top-[373px] z-10 hidden h-0 w-0 sm:block">
      <div
        aria-hidden="true"
        className="absolute z-30 h-0 w-0 transform-gpu animate-orbit [animation-delay:calc(var(--delay)*1000ms)]"
        style={
          {
            "--duration": 9,
            "--radius": 325,
            "--delay": -4.5,
            animationDelay: "-4.5s",
            animationFillMode: "both",
          } as React.CSSProperties
        }
      >
        <div className="orbit-offset-avatar absolute left-1/2 top-1/2 z-30 flex h-48 w-48 items-center justify-center rounded-full border-none bg-transparent dark:bg-white/10 [animation-delay:calc(var(--delay)*1000ms)] [animation-fill-mode:both]">
          <img
            alt=""
            className="h-48 w-48 rounded-full shadow-lg"
            draggable={false}
            src="/avatar-dog.jpg"
          />
        </div>
      </div>

      <div
        aria-hidden="true"
        className="absolute h-0 w-0 transform-gpu animate-orbit [animation-delay:calc(var(--delay)*1000ms)]"
        style={
          {
            "--duration": 20,
            "--radius": 325,
            "--delay": -15,
            animationDelay: "-15s",
            animationFillMode: "both",
          } as React.CSSProperties
        }
        >
          <div className="orbit-offset-chrome absolute left-1/2 top-1/2 flex h-12 w-12 items-center justify-center rounded-full border-none bg-transparent dark:bg-white/10 [animation-delay:calc(var(--delay)*1000ms)] [animation-fill-mode:both]">
          <OrbitIconImage
            className="h-14 w-14 object-contain drop-shadow-lg"
            src={topOrbitIcon}
          />
          </div>
        </div>

      <div
        aria-hidden="true"
        className="absolute h-0 w-0 transform-gpu animate-orbit [animation-delay:calc(var(--delay)*1000ms)]"
        style={
          {
            "--duration": 16,
            "--radius": 325,
            "--delay": 0,
            animationDelay: "0s",
            animationFillMode: "both",
          } as React.CSSProperties
        }
        >
          <div className="orbit-offset-eth absolute left-1/2 top-1/2 flex h-12 w-12 items-center justify-center rounded-full border-none bg-transparent dark:bg-white/10 [animation-delay:calc(var(--delay)*1000ms)] [animation-fill-mode:both]">
          <OrbitIconImage
            className="h-[60px] w-[60px] object-contain drop-shadow-lg"
            src={rightOrbitIcon}
          />
          </div>
        </div>

      <div
        aria-hidden="true"
        className="absolute h-0 w-0 transform-gpu animate-orbit [animation-delay:calc(var(--delay)*1000ms)]"
        style={
          {
            "--duration": 13,
            "--radius": 325,
            "--delay": -3.25,
            animationDelay: "-3.25s",
            animationFillMode: "both",
          } as React.CSSProperties
        }
        >
          <div className="orbit-offset-edge absolute left-1/2 top-1/2 flex h-12 w-12 items-center justify-center rounded-full border-none bg-transparent dark:bg-white/10 [animation-delay:calc(var(--delay)*1000ms)] [animation-fill-mode:both]">
          <OrbitIconImage
            className="h-[60px] w-[60px] object-contain drop-shadow-lg"
            src={bottomOrbitIcon}
          />
        </div>
      </div>
    </div>
  );
}

function FloatingElements() {
  return <OrbitElements />;
}

const HeroTitleBlock = memo(function HeroTitleBlock() {
  return (
    <CardItem
      translateZ={50}
      className="w-fit transition duration-200 ease-linear"
      style={{
        transform:
          "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
      }}
    >
      <h1 className="border-b-2 border-slate-700 py-6">
        <div
          className="relative z-10 inline-block w-[5.8em] whitespace-nowrap px-2 text-center font-coda text-5xl font-bold leading-[60px] text-orange-400 md:text-6xl"
          style={{
            fontFamily: 'Coda, "Coda Fallback", cursive, fantasy',
            fontSize: "60px",
            lineHeight: "60px",
            color: "rgb(251, 146, 60)",
          }}
        >
          <MorphingText
            className="h-[60px] text-center"
            texts={titleWords}
          />
        </div>
      </h1>
    </CardItem>
  );
});

function TextContent() {
  const [hoveredIdentity, setHoveredIdentity] = useState<number | null>(null);

  return (
    <div className="relative z-10">
      <CardItem
        translateZ={18}
        className="w-fit transition duration-200 ease-linear"
        style={{
          transform:
            "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
        }}
      >
        <p className="text-lg font-bold leading-7 text-slate-700">
          I am:
        </p>
      </CardItem>

      <HeroTitleBlock />

      <div className="[transform-style:preserve-3d] [&>*]:[transform-style:preserve-3d]">
        <div className="pt-4 text-end text-sm leading-7 text-slate-700 md:text-lg">
          <CardItem
            translateZ={18}
            className="w-fit transition duration-200 ease-linear"
            style={{
              transform:
                "translateX(0px) translateY(0px) translateZ(0px) rotateX(0deg) rotateY(0deg) rotateZ(0deg)",
            }}
          >
            <p className="mb-4 text-start text-lg font-bold leading-7">
              核心优势:
            </p>
          </CardItem>
          <CardItem
            translateZ={22}
            className="flex h-[196px] w-full flex-col justify-between"
            onMouseLeave={() => setHoveredIdentity(null)}
          >
            {identityLines.map((line, index) => (
              <div key={line}>
                <a
                  className={
                    hoveredIdentity !== null && hoveredIdentity !== index
                      ? "text-[#BABABA] transition-colors duration-200 ease-out"
                      : "text-slate-700 transition-colors duration-200 ease-out"
                  }
                  href="#code"
                  onMouseEnter={() => setHoveredIdentity(index)}
                >
                  {line}
                </a>
              </div>
            ))}
          </CardItem>
        </div>
      </div>
    </div>
  );
}

function HeroCard() {
  return (
    <CardContainer
      containerClassName="absolute left-1/2 top-[144px] z-20 w-full max-w-[412px] -translate-x-1/2 !py-0"
      className="w-full"
    >
      <CardBody
        className="relative h-[458px] w-full rounded-3xl bg-[linear-gradient(to_right_bottom,#fcfcfd_20%,#d0d2d7_150%)] p-8 [box-shadow:0_25px_50px_-12px_rgba(0,0,0,0.1)]"
      >
        <TextContent />
        <CardItem
          translateZ={40}
          className="absolute -bottom-4 -left-4 z-0 h-16 w-16 rounded-full bg-orange-400"
        >
          <span className="block h-full w-full rounded-full bg-orange-400" />
        </CardItem>
      </CardBody>
    </CardContainer>
  );
}

function HeroContainer() {
  return (
    <main className="min-h-screen bg-[linear-gradient(to_bottom,#f8fafc_0%,#f1f5f9_100%)] text-slate-700">
      <section
        id="home"
        className="relative z-10 min-h-[850px] w-full select-none px-4 pt-[96px] lg:px-16 xl:px-32 2xl:px-44"
      >
        <div className="relative h-[700px] w-full">
          <OrbitBackground />
          <FloatingElements />
          <HeroCard />
        </div>
      </section>
    </main>
  );
}

export function HeroSection() {
  return (
    <>
      <TopNav />
      <HeroContainer />
    </>
  );
}
