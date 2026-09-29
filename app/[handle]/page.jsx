import Link from "next/link"
import clientPromise from "../../lib/mongodb"
import { notFound } from "next/navigation"
import ShareButton from "../../components/ShareButton"

export default async function Page({ params }) {
  const client = await clientPromise;
  const db = client.db('linkpilot');
  const collection = db.collection('links');

  const { handle } = await params;
  const obj = await collection.findOne({ Handle: handle });

  if (!obj) return notFound();

  const normalizeUrl = (url) => {
    if (!url) return "#";
    const trimmed = url.trim();
    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      return trimmed;
    }
    return `https://${trimmed}`;
  };

  return (
    <div className="flex flex-col min-h-screen justify-between py-12 sm:py-20 items-center bg-pink-300 px-4">
      <div className="flex flex-col gap-4 justify-center items-center w-full max-w-sm">

        {/* Share Button at Top */}
        <div className="w-full flex justify-end">
          <ShareButton handle={obj.Handle} />
        </div>

        {/* Avatar */}
        {obj.Picture ? (
          <img
            src={obj.Picture}
            alt={obj.Handle}
            className="h-24 w-24 sm:h-28 sm:w-28 rounded-full object-cover shadow-lg border-4 border-white"
          />
        ) : (
          <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full bg-purple-200 text-purple-900 border-4 border-white flex items-center justify-center font-extrabold text-3xl shadow-lg">
            {obj.Handle[0]?.toUpperCase() || "L"}
          </div>
        )}

        {/* Handle */}
        <h1 className="text-xl sm:text-2xl font-extrabold text-gray-950">
          @{obj.Handle}
        </h1>

        {/* Description */}
        {obj.Description && (
          <p className="text-gray-800 text-sm sm:text-base text-center max-w-xs font-medium leading-relaxed">
            {obj.Description}
          </p>
        )}

        {/* Links */}
        <div className="flex flex-col gap-3 items-center w-full mt-2">
          {obj.Links && obj.Links.length > 0 ? (
            obj.Links.map((e, i) => (
              <a
                key={i}
                href={normalizeUrl(e.link)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full group"
              >
                <div className="shadow-md w-full text-center bg-white px-6 py-3.5 rounded-2xl text-base sm:text-lg font-bold text-gray-900 group-hover:bg-gray-50 group-hover:scale-[1.02] group-hover:shadow-lg active:scale-[0.99] transition duration-150">
                  {e.linkText || "Visit Link"}
                </div>
              </a>
            ))
          ) : (
            <p className="text-sm text-gray-600">No links added yet.</p>
          )}
        </div>
      </div>

      {/* Footer CTA */}
      <footer className="mt-8 text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 hover:bg-white text-gray-800 text-xs font-bold shadow-sm transition"
        >
          <span>Powered by</span>
          <span className="font-extrabold text-black">LinkPilot</span>
        </Link>
      </footer>
    </div>
  );
}