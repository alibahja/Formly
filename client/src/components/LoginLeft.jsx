import React from "react";

const LoginLeft = () => {
  return (
    <div className="relative flex flex-col justify-between w-full p-10 overflow-hidden text-white xl:p-14 bg-[url('/bg-img.png')] bg-cover bg-center">
      {/* Dark overlay for text contrast */}
      <div className="absolute inset-0 bg-slate-950/55" />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5">
        <img src="/logo.svg" alt="Logo" className="size-7" />
        <span className="text-lg font-semibold tracking-tight">Formly</span>
      </div>

      {/* Copy */}
      <div className="relative max-w-md">
        <h2 className="text-3xl font-semibold leading-tight tracking-tight xl:text-4xl">
          Build beautiful forms in seconds
        </h2>
        <p className="mt-5 text-sm leading-relaxed text-white/75 xl:text-base">
          Describe what you need, and AI designs the fields, validation, and
          layout for you. Publish it, share the link, and collect responses —
          all in one place.
        </p>

        {/* Small feature list */}
        <ul className="mt-8 space-y-2.5 text-sm text-white/70">
          <li className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-full size-5 bg-white/10">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3 text-emerald-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.01l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.19l6.79-6.9a1 1 0 0 1 1.414 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            AI-generated fields with validation
          </li>
          <li className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-full size-5 bg-white/10">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3 text-emerald-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.01l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.19l6.79-6.9a1 1 0 0 1 1.414 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            Live preview as you edit
          </li>
          <li className="flex items-center gap-2">
            <span className="flex items-center justify-center rounded-full size-5 bg-white/10">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                className="size-3 text-emerald-400"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.6a1 1 0 0 1-1.42.01l-3.5-3.5a1 1 0 1 1 1.414-1.414L8.5 12.19l6.79-6.9a1 1 0 0 1 1.414 0Z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            Collect and manage responses
          </li>
        </ul>
      </div>

      {/* Footer */}
      <p className="relative text-xs text-white/60">
        © {new Date().getFullYear()} Formly. All rights reserved.
      </p>
    </div>
  );
};

export default LoginLeft;