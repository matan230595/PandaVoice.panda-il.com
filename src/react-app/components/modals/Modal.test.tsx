import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import Modal from "./Modal";

describe("Modal", () => {
  it("renders when open", () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="בדיקה">
        <p>תוכן המודל</p>
      </Modal>
    );
    expect(screen.getByText("בדיקה")).toBeDefined();
    expect(screen.getByText("תוכן המודל")).toBeDefined();
  });

  it("does not render when closed", () => {
    render(
      <Modal isOpen={false} onClose={() => {}} title="בדיקה">
        <p>תוכן המודל</p>
      </Modal>
    );
    expect(screen.queryByText("בדיקה")).toBeNull();
  });
});
