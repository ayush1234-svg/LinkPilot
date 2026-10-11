"use client"
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signIn, signOut } from 'next-auth/react'

const Logo = ({ className = "h-7" }) => (
    <svg className={className} viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 18L34 4L22 34L18 20L3 18Z" fill="currentColor" />
        <text x="46" y="29" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="26" letterSpacing="-0.5" fill="currentColor">LinkPilot</text>
    </svg>
)

const GoogleIcon = ({ className = "w-4 h-4" }) => (
    <svg className={className} viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
    </svg>
)

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session, status } = useSession();

    const [search, setSearch] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    const debounceRef = useRef(null);
    const desktopSearchRef = useRef(null);
    const mobileSearchRef = useRef(null);
    const mobileInputRef = useRef(null);

    const showpath = ['/', '/generate'].includes(pathname);

    const fetchSuggestions = async (query) => {
        if (!query.trim()) return;
        setLoadingSuggestions(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
            const data = await res.json();
            if (data.success) {
                setSuggestions(data.results);
                setShowDropdown(data.results.length > 0);
            }
        } catch {
            setSuggestions([]);
        } finally {
            setLoadingSuggestions(false);
        }
    };

    const handleSearchChange = (value) => {
        setSearch(value);
        if (!value.trim()) {
            setSuggestions([]);
            setShowDropdown(false);
        }
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!search.trim()) return;
        debounceRef.current = setTimeout(() => fetchSuggestions(search), 250);
        return () => clearTimeout(debounceRef.current);
    }, [search]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClick = (e) => {
            const inDesktop = desktopSearchRef.current && desktopSearchRef.current.contains(e.target);
            const inMobile = mobileSearchRef.current && mobileSearchRef.current.contains(e.target);
            if (!inDesktop && !inMobile) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClick);
        document.addEventListener('touchstart', handleClick);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            document.removeEventListener('touchstart', handleClick);
        };
    }, []);

    // Focus input when mobile search is opened
    useEffect(() => {
        if (mobileSearchOpen && mobileInputRef.current) {
            setTimeout(() => mobileInputRef.current?.focus(), 50);
        }
    }, [mobileSearchOpen]);

    const navigate = (path) => {
        setShowDropdown(false);
        setMobileMenuOpen(false);
        setMobileSearchOpen(false);
        setSearch("");
        router.push(path);
    };

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmed = search.trim();
        if (trimmed) {
            navigate(`/${trimmed}`);
        }
    };

    if (!showpath) return null;

    return (
        <>
            {/* ── DESKTOP NAVBAR (Pill) ── */}
            <nav className='hidden md:flex w-[90vw] max-w-5xl fixed justify-between items-center top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 z-50 transition-all'>
                <Link href="/" className="hover:opacity-80 transition">
                    <Logo className="h-8" />
                </Link>

                <div className='flex gap-3 items-center'>
                    {/* Search */}
                    <div ref={desktopSearchRef} className="relative">
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search handle..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                className="pl-9 pr-8 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-56 bg-gray-50 focus:bg-white transition"
                            />
                            {/* Search Icon */}
                            <svg className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {/* Spinner or Clear */}
                            {loadingSuggestions ? (
                                <span className="absolute right-3 text-xs text-gray-400 animate-spin">⟳</span>
                            ) : search ? (
                                <button type="button" onClick={() => handleSearchChange("")} className="absolute right-3 text-gray-400 hover:text-gray-600 text-xs">✕</button>
                            ) : null}
                        </form>

                        {/* Desktop Dropdown */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-50 divide-y divide-gray-100">
                                {suggestions.map((user) => (
                                    <button
                                        key={user.Handle}
                                        type="button"
                                        onClick={() => navigate(`/${user.Handle}`)}
                                        className="flex items-center gap-3 w-full px-4 py-3 hover:bg-gray-50 transition text-left"
                                    >
                                        {user.Picture ? (
                                            <img src={user.Picture} alt={user.Handle} className="h-8 w-8 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                        ) : (
                                            <div className="h-8 w-8 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {user.Handle[0].toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-semibold text-gray-800">@{user.Handle}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Auth & Action Buttons */}
                    {status === 'loading' ? (
                        <div className="w-20 h-9 bg-gray-100 rounded-full animate-pulse" />
                    ) : session ? (
                        <div className="flex items-center gap-3 pl-2 border-l border-gray-200">
                            <Link
                                href="/generate"
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-full hover:bg-gray-100 transition"
                                title="Manage LinkPilot"
                            >
                                {session.user?.image ? (
                                    <img
                                        src={session.user.image}
                                        alt={session.user.name || "User"}
                                        className="h-7 w-7 rounded-full object-cover border border-gray-300 shadow-sm"
                                    />
                                ) : (
                                    <div className="h-7 w-7 rounded-full bg-black text-white text-xs font-bold flex items-center justify-center">
                                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                                <span className="text-xs font-bold text-gray-800 max-w-[90px] truncate">
                                    {session.user?.name?.split(" ")[0]}
                                </span>
                            </Link>

                            {pathname !== '/generate' && (
                                <Link href="/generate">
                                    <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full font-semibold text-xs transition shadow-sm">
                                        Manage Links
                                    </button>
                                </Link>
                            )}

                            <button
                                onClick={() => signOut()}
                                className="text-xs font-semibold text-gray-500 hover:text-red-600 transition px-2 py-1"
                                title="Sign out"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 pl-2 border-l border-gray-200">
                            <button
                                onClick={() => signIn("google")}
                                className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-2 rounded-full font-semibold text-xs transition shadow-sm hover:shadow"
                            >
                                <GoogleIcon className="w-3.5 h-3.5" />
                                <span>Sign In</span>
                            </button>

                            {pathname !== '/generate' && (
                                <Link href="/generate">
                                    <button className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-full font-semibold text-xs transition shadow-sm">
                                        Create Yours →
                                    </button>
                                </Link>
                            )}
                        </div>
                    )}
                </div>
            </nav>

            {/* ── MOBILE NAVBAR ── */}
            <nav className='md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-3 sm:px-4 h-14 flex justify-between items-center'>
                {mobileSearchOpen ? (
                    <div ref={mobileSearchRef} className="flex items-center w-full gap-2">
                        <form onSubmit={handleSearchSubmit} className="relative flex-1 flex items-center">
                            <svg className="w-4 h-4 absolute left-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                ref={mobileInputRef}
                                type="text"
                                placeholder="Search by handle..."
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-gray-100 border border-transparent focus:border-green-600 focus:bg-white rounded-full text-sm focus:outline-none transition"
                            />
                            {search && (
                                <button type="button" onClick={() => handleSearchChange("")} className="absolute right-3 text-gray-400 hover:text-gray-600 text-xs">
                                    ✕
                                </button>
                            )}
                        </form>
                        <button
                            type="button"
                            onClick={() => { setMobileSearchOpen(false); setShowDropdown(false); handleSearchChange(""); }}
                            className="text-xs font-semibold text-gray-600 hover:text-black px-2 py-1"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <>
                        <Link href="/" className="flex shrink-0 items-center">
                            <Logo className="h-auto w-[120px] max-[360px]:w-[96px]" />
                        </Link>

                        <div className="flex shrink-0 items-center gap-1.5">
                            {/* Search Button on Mobile */}
                            <button
                                onClick={() => { setMobileSearchOpen(true); setMobileMenuOpen(false); }}
                                className="flex shrink-0 items-center gap-1 px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition"
                                aria-label="Search profiles"
                            >
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="hidden min-[380px]:inline">Search</span>
                            </button>

                            {/* Google Sign In or Avatar indicator */}
                            {session ? (
                                <Link href="/generate" className="flex items-center">
                                    {session.user?.image ? (
                                        <img
                                            src={session.user.image}
                                            alt={session.user.name || "User"}
                                            className="h-7 w-7 rounded-full object-cover border border-gray-300 shadow-sm"
                                        />
                                    ) : (
                                        <div className="h-7 w-7 rounded-full bg-black text-white text-[10px] font-bold flex items-center justify-center">
                                            {session.user?.name?.[0]?.toUpperCase() || "U"}
                                        </div>
                                    )}
                                </Link>
                            ) : (
                                <button
                                    onClick={() => signIn("google")}
                                    className="inline-flex shrink-0 items-center gap-1 bg-white border border-gray-200 text-gray-800 px-2.5 py-1.5 rounded-full text-xs font-semibold shadow-sm hover:bg-gray-50"
                                >
                                    <GoogleIcon className="w-3 h-3" />
                                    <span>Sign In</span>
                                </button>
                            )}

                            {/* Hamburger Menu Toggle */}
                            <button
                                onClick={() => { setMobileMenuOpen(!mobileMenuOpen); setMobileSearchOpen(false); }}
                                className="shrink-0 p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition"
                                aria-label="Toggle menu"
                            >
                                {mobileMenuOpen ? (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                ) : (
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </>
                )}
            </nav>

            {/* ── MOBILE SEARCH DROPDOWN ── */}
            {mobileSearchOpen && showDropdown && suggestions.length > 0 && (
                <div ref={mobileSearchRef} className="md:hidden fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-xl max-h-[70vh] overflow-y-auto">
                    <p className="px-4 py-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider bg-gray-50">
                        Matching Profiles
                    </p>
                    <div className="divide-y divide-gray-100">
                        {suggestions.map((user) => (
                            <button
                                key={user.Handle}
                                type="button"
                                onClick={() => navigate(`/${user.Handle}`)}
                                className="flex items-center gap-3 w-full px-4 py-3.5 hover:bg-gray-50 active:bg-gray-100 transition text-left"
                            >
                                {user.Picture ? (
                                    <img src={user.Picture} alt={user.Handle} className="h-9 w-9 rounded-full object-cover flex-shrink-0 border border-gray-200" />
                                ) : (
                                    <div className="h-9 w-9 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center font-bold text-sm flex-shrink-0">
                                        {user.Handle[0].toUpperCase()}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-semibold text-gray-900">@{user.Handle}</p>
                                    <p className="text-xs text-gray-500">View LinkPilot</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* ── MOBILE SLIDE-DOWN DRAWER MENU ── */}
            {mobileMenuOpen && !mobileSearchOpen && (
                <div className='md:hidden fixed top-14 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-xl px-4 py-5 flex flex-col gap-4 animate-in slide-in-from-top-2'>
                    {/* User Profile Card in Drawer */}
                    {session ? (
                        <div className="p-3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {session.user?.image ? (
                                    <img src={session.user.image} alt={session.user.name || "User"} className="h-10 w-10 rounded-full object-cover border border-gray-300" />
                                ) : (
                                    <div className="h-10 w-10 rounded-full bg-black text-white font-bold text-sm flex items-center justify-center">
                                        {session.user?.name?.[0]?.toUpperCase() || "U"}
                                    </div>
                                )}
                                <div>
                                    <p className="text-sm font-bold text-gray-900">{session.user?.name}</p>
                                    <p className="text-xs text-gray-500 truncate max-w-[170px]">{session.user?.email}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => { setMobileMenuOpen(false); signOut(); }}
                                className="text-xs font-bold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition"
                            >
                                Sign Out
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={() => { setMobileMenuOpen(false); signIn("google"); }}
                            className="w-full flex items-center justify-center gap-2.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 px-4 py-3 rounded-xl font-bold text-sm shadow-sm transition"
                        >
                            <GoogleIcon className="w-4 h-4" />
                            <span>Sign In with Google</span>
                        </button>
                    )}

                    <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-100 transition flex items-center justify-between"
                        >
                            <span>Home</span>
                            <span>→</span>
                        </Link>

                        <Link
                            href="/generate"
                            onClick={() => setMobileMenuOpen(false)}
                            className="w-full"
                        >
                            <button className="w-full bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold text-sm transition shadow">
                                {session ? "Manage My LinkPilot →" : "Create Your LinkPilot →"}
                            </button>
                        </Link>
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar