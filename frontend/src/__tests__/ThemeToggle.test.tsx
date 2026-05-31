"use client";

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider } from "@/context/ThemeContext";
import { ThemeToggle } from "@/components/ThemeToggle";

// Mock localStorage and matchMedia
beforeEach(() => {
  Object.defineProperty(window, "localStorage", {
    value: {
      getItem: jest.fn(() => null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
    },
    writable: true,
  });
  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
  document.documentElement.removeAttribute("data-theme");
});

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>
  );
}

describe("ThemeToggle", () => {
  it("renders a button with aria-label", () => {
    renderToggle();
    const btn = screen.getByRole("button", { name: /toggle theme/i });
    expect(btn).toBeInTheDocument();
  });

  it("is keyboard accessible (focusable button)", () => {
    renderToggle();
    const btn = screen.getByRole("button", { name: /toggle theme/i });
    btn.focus();
    expect(document.activeElement).toBe(btn);
  });

  it("toggles data-theme attribute on click", () => {
    renderToggle();
    const btn = screen.getByRole("button", { name: /toggle theme/i });
    // Initial theme is dark (no stored preference, matchMedia returns false for light)
    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    fireEvent.click(btn);
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("persists theme to localStorage on toggle", () => {
    renderToggle();
    const btn = screen.getByRole("button", { name: /toggle theme/i });
    fireEvent.click(btn);
    expect(window.localStorage.setItem).toHaveBeenCalledWith("theme", "light");
  });

  it("uses OS preference on first visit when no stored theme", () => {
    // Simulate OS preference for light mode
    (window.matchMedia as jest.Mock).mockImplementation((query: string) => ({
      matches: query === "(prefers-color-scheme: light)",
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));

    renderToggle();
    // After mount, data-theme should be "light" due to OS preference
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });
});
