/**
 * object-position for photos whose shape fights the frame they are shown in (judged on a contact sheet,
 * 2026-10-07). Everything not listed is a 3:2 landscape and crops from the centre.
 *
 * - skyline-penthouse exterior is a 2:3 tower: keep the upper-middle floors, not sky or street.
 * - loft exterior is near-square: keep the arched windows near the top.
 * - loft living and garden-home bath-or-detail are portraits: keep the room's middle band.
 * - agent portraits are 2:3 and land in 1:1 / 4:5 frames: keep the face (agent-1 is seated, face high).
 */
const CROPS: Record<string, string> = {
  'listings/skyline-penthouse-nyc/exterior.jpg': '50% 60%',
  'listings/loft-chicago/exterior.jpg': '50% 30%',
  'listings/loft-chicago/living.jpg': '50% 65%',
  'listings/garden-home-austin/bath-or-detail.jpg': '50% 55%',
  'agents/agent-1.jpg': '50% 12%',
  'agents/agent-2.jpg': '50% 20%',
  'agents/agent-3.jpg': '55% 40%',
  'agents/agent-4.jpg': '50% 20%',
  'agents/agent-5.jpg': '50% 20%',
  'agents/agent-6.jpg': '50% 20%',
};

export function cropFor(file: string | undefined): string | undefined {
  return file ? CROPS[file] : undefined;
}
