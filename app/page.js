import Link from "next/link";
import Icon from "./Icon";

// Static list of every dining hall the app supports. `id` must match both
// the FastAPI `locationId` lookup (app/main.py) and an icon filename in
// public/icons/<id>.jpg.
const diningHalls = [
  { id: "annenberg", name: "Annenberg" },
  { id: "adams", name: "Adams House" },
  { id: "cabot", name: "Cabot House" },
  { id: "currier", name: "Currier House" },
  { id: "dunster", name: "Dunster House" },
  { id: "eliot", name: "Eliot House" },
  { id: "kirkland", name: "Kirkland House" },
  { id: "leverett", name: "Leverett House" },
  { id: "lowell", name: "Lowell House" },
  { id: "mather", name: "Mather House" },
  { id: "pforzheimer", name: "Pforzheimer House" },
  { id: "quincy", name: "Quincy House" },
  { id: "winthrop", name: "Winthrop House" },
  { id: "fly-by", name: "Fly-By" },
];

// Landing page: a grid of dining halls, each linking to /dining/<id>.
export default function HomePage() {
  return (
    <div>
      <h1 className="page-title">Choose a Dining Hall</h1>
      <div className="dining-hall-grid">
        {diningHalls.map((hall) => (
          <Link key={hall.id} href={`/dining/${hall.id}`} className="dining-hall-card">
            <Icon id={hall.id} name={hall.name} />
            <span>{hall.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
