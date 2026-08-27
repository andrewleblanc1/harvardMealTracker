import HallLayout from "../HallLayout";

// Route: /dining/<hall-id>. Thin wrapper that just tells HallLayout
// which hall it's rendering (id must match app/main.py's locationId map
// and a public/icons/<id>.jpg file).
export default function PforzheimerPage() {
  return <HallLayout id="pforzheimer" name="Pforzheimer House" />;
}
