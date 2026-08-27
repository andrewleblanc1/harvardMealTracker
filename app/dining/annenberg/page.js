import HallLayout from "../HallLayout";

// Route: /dining/<hall-id>. Thin wrapper that just tells HallLayout
// which hall it's rendering (id must match app/main.py's locationId map
// and a public/icons/<id>.jpg file).
export default function AnnenbergPage() {
  return <HallLayout id="annenberg" name="Annenberg" />;
}
