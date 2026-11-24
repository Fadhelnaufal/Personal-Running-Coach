import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MetricValue } from "@/components/shared/MetricValue";
import { StatePanel } from "@/components/shared/StatePanel";
import { WorkoutStatus } from "@/components/shared/WorkoutStatus";
import { MISSING_VALUE_LABEL } from "@/lib/utils/units";

describe("Foundational shared components", () => {
  it("renders missing metric values honestly without zero coercion", () => {
    render(<MetricValue label="Weekly Distance" value={null} unit="km" />);
    expect(screen.getByText("Weekly Distance")).toBeInTheDocument();
    expect(screen.getByText(MISSING_VALUE_LABEL)).toBeInTheDocument();
  });

  it("renders loading, empty, and error states distinctly", () => {
    const { rerender } = render(
      <StatePanel kind="loading" title="Loading runs" description="Please wait." />
    );
    expect(screen.getByRole("status")).toHaveAttribute("aria-busy", "true");

    rerender(<StatePanel kind="empty" title="Empty runs" description="Nothing yet." />);
    expect(screen.getByText("Empty runs")).toBeInTheDocument();

    rerender(<StatePanel kind="error" title="Sync error" description="Retry later." />);
    expect(screen.getByRole("alert")).toHaveTextContent("Sync error");
  });

  it("renders workout status with text label, never color alone", () => {
    render(<WorkoutStatus status="missed" />);
    expect(screen.getByText("Missed (Unresolved)")).toBeInTheDocument();
  });
});
