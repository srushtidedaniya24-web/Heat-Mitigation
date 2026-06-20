import { Link } from "react-router-dom";

export default function PlaceholderPage({ title }) {
  return (
    <main className="min-h-screen bg-background text-on-surface grid place-items-center p-6">
      <section className="w-full max-w-xl rounded-xl border border-outline-variant bg-surface-container-low p-8 text-center">
        <span className="material-symbols-outlined mb-4 text-5xl text-primary">construction</span>
        <h1 className="font-display-md text-display-md text-primary">{title}</h1>
        <p className="mt-3 text-on-surface-variant">
          This route is ready for the next ThermaCity module.
        </p>
        <Link className="mt-6 inline-flex rounded bg-primary px-5 py-2 font-bold text-on-primary" to="/">
          Return to Overview
        </Link>
      </section>
    </main>
  );
}
