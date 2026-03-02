import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../components/ui/button";
import { describe, it, expect, vi } from "vitest";

describe("Button", () => {
    it("should render correctly", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button")).toHaveTextContent("Click me");
    });

    it("should handle click events", () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click me</Button>);
        fireEvent.click(screen.getByRole("button"));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("should apply variant classes", () => {
        render(<Button variant="destructive">Delete</Button>);
        expect(screen.getByRole("button")).toHaveClass("bg-destructive");
    });
});
