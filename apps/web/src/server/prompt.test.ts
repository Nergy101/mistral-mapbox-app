import { describe, expect, it } from "bun:test";

import { AREAS, areaById } from "../map/areas";
import { buildSystemPrompt } from "./prompt";

describe("buildSystemPrompt", () => {
  it("lists every area with its id and facts", () => {
    const prompt = buildSystemPrompt(AREAS, undefined);
    for (const area of AREAS) {
      expect(prompt).toContain(area.name);
      expect(prompt).toContain(`id: "${area.id}"`);
    }
    expect(prompt).toContain("No area is currently selected");
  });

  it("names the selected area when one is given", () => {
    const selected = areaById("louvre");
    expect(selected?.name).toBe("Louvre & Palais-Royal");
    const prompt = buildSystemPrompt(AREAS, selected);
    expect(prompt).toContain('currently selected "Louvre & Palais-Royal"');
  });
});
