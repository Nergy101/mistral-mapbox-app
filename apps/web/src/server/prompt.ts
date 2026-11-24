import type { Area } from "../map/areas";

/**
 * The system prompt for the map chat: it grounds the model in the areas actually drawn on the map
 * and in the area the user has selected, so answers refer to what is on screen.
 */
export const buildSystemPrompt = (
  areas: readonly Area[],
  selected: Area | undefined
): string => {
  const list = areas
    .map(
      (area) =>
        `- ${area.name} (id: "${area.id}", center: ${area.center[0]}, ${area.center[1]}): ${area.description} Facts: ${area.facts.join("; ")}.`
    )
    .join("\n");

  const selection =
    selected === undefined
      ? "No area is currently selected on the map."
      : `The user has currently selected "${selected.name}" (id: "${selected.id}"). When the question says "this area", "here" or "the selected place", it means ${selected.name}.`;

  return [
    "You are the assistant of an interactive map of Paris. The map shows these areas:",
    list,
    "",
    selection,
    "",
    "Answer the user's questions about the selected area or any of the areas on the map.",
    "Stay grounded in the descriptions and facts above; if something is not covered by them, say so briefly.",
    "Keep answers short (two to four sentences) unless the user asks for more detail.",
  ].join("\n");
};
