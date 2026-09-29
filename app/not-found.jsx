import Link from "next/link"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#254f1a] flex flex-col items-center justify-center px-4 text-center">
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-8 sm:p-12 max-w-md w-full shadow-2xl flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-yellow-300/20 text-yellow-300 flex items-center justify-center text-3xl mb-4 font-bold">
          ?
        </div>
        <h1 className="text-3xl font-extrabold text-yellow-300 tracking-tight">
          Profile Not Found
        </h1>
        <p className="text-yellow-100 text-sm mt-3 leading-relaxed">
          The handle you are looking for doesn't exist or hasn't been claimed yet.
        </p>

        <div className="flex flex-col gap-3 w-full mt-6">
          <Link href="/generate" className="w-full">
            <button className="w-full bg-pink-300 hover:bg-pink-400 active:scale-[0.98] text-gray-950 font-bold py-3.5 px-6 rounded-2xl transition shadow-md text-sm">
              Claim Your Handle on LinkPilot →
            </button>
          </Link>
          <Link href="/" className="w-full">
            <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-2xl transition text-sm">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}
