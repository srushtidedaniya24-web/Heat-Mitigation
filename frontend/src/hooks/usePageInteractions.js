import { useEffect } from "react";

function listen(element, eventName, handler) {
  element.addEventListener(eventName, handler);
  return () => element.removeEventListener(eventName, handler);
}

export default function usePageInteractions(rootRef, page) {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const cleanups = [];
    const timers = [];

    if (page === "overview") {
      const status = root.querySelector("p.italic");
      if (status) {
        const timer = window.setInterval(() => {
          status.textContent = `Updated ${Math.floor(Math.random() * 5) + 1}m ago`;
        }, 120000);
        timers.push(timer);
      }
    }

    if (page === "optimization") {
      root.querySelectorAll('input[type="range"]').forEach((slider) => {
        const update = (event) => {
          const label = event.currentTarget.nextElementSibling;
          if (label) label.textContent = `${event.currentTarget.value}%`;
        };
        cleanups.push(listen(slider, "input", update));
      });
    }

    if (page === "analysis") {
      root.querySelectorAll(".group").forEach((row) => {
        const press = () => {
          row.classList.add("scale-95");
          const timer = window.setTimeout(() => row.classList.remove("scale-95"), 150);
          timers.push(timer);
        };
        cleanups.push(listen(row, "click", press));
      });
    }

    if (page === "materials") {
      root.querySelectorAll(".glass-panel").forEach((panel) => {
        const enter = () => {
          panel.style.transform = "translateY(-2px)";
          panel.style.transition = "transform 0.2s ease-out";
        };
        const leave = () => {
          panel.style.transform = "translateY(0)";
        };
        cleanups.push(listen(panel, "mouseenter", enter));
        cleanups.push(listen(panel, "mouseleave", leave));
      });

      root.querySelectorAll(".h-full.transition-all").forEach((bar) => {
        const width = bar.style.width;
        if (!width) return;
        bar.style.width = "0%";
        const timer = window.setTimeout(() => {
          bar.style.width = width;
        }, 300);
        timers.push(timer);
      });
    }

    if (page === "alerts") {
      root.querySelectorAll("button").forEach((button) => {
        if (!button.textContent.includes("Mark Resolved")) return;
        const resolveAlert = () => {
          const card = button.closest('[data-alert-card="true"]') || button.closest(".bg-surface-container");
          if (card) {
            card.style.opacity = "0.5";
            card.style.filter = "grayscale(1)";
          }
          button.textContent = "Resolved";
          button.disabled = true;
          button.classList.add("opacity-50", "cursor-not-allowed");
        };
        cleanups.push(listen(button, "click", resolveAlert));
      });
    }

    if (page === "heatmaps") {
      root.querySelectorAll('[data-toggle-layer="true"]').forEach((button) => {
        const toggle = () => {
          const enabled = button.classList.contains("bg-primary");
          button.classList.toggle("bg-primary", !enabled);
          button.classList.toggle("bg-surface-variant", enabled);
          const knob = button.firstElementChild;
          if (knob) {
            knob.classList.toggle("translate-x-5", !enabled);
            knob.classList.toggle("translate-x-0", enabled);
          }
        };
        cleanups.push(listen(button, "click", toggle));
      });

      root.querySelectorAll('[class*="bg-surface-container-highest/60"]').forEach((label) => {
        const enter = () => {
          label.classList.remove("bg-surface-container-highest/60");
          label.classList.add("bg-surface-container-highest/90");
        };
        const leave = () => {
          label.classList.remove("bg-surface-container-highest/90");
          label.classList.add("bg-surface-container-highest/60");
        };
        cleanups.push(listen(label, "mouseenter", enter));
        cleanups.push(listen(label, "mouseleave", leave));
      });
    }

    root.querySelectorAll("button").forEach((button) => {
      const down = () => button.classList.add("scale-95");
      const up = () => button.classList.remove("scale-95");
      cleanups.push(listen(button, "pointerdown", down));
      cleanups.push(listen(button, "pointerup", up));
      cleanups.push(listen(button, "pointerleave", up));
    });

    return () => {
      cleanups.forEach((cleanup) => cleanup());
      timers.forEach((timer) => {
        window.clearInterval(timer);
        window.clearTimeout(timer);
      });
    };
  }, [page, rootRef]);
}
