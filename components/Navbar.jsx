"use client"
import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const Logo = ({ className = "h-7" }) => (
    <svg className={className} viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg">
        <path d="M4 18L34 4L22 34L18 20L3 18Z" fill="currentColor" />
        <text x="46" y="29" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="800" fontSize="26" letterSpacing="-0.5" fill="currentColor">LinkPilot</text>
    </svg>
)

const Navbar = () => {
    const pathname = usePathname();
    const router = useRouter();
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
        if (!query.trim()) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
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

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (!search.trim()) {
            setSuggestions([]);
            setShowDropdown(false);
            return;
        }
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
            <nav className='hidden md:flex w-[85vw] max-w-4xl fixed justify-between items-center top-6 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-gray-100 z-50 transition-all'>
                <Link href="/" className="hover:opacity-80 transition">
                    <Logo className="h-8" />
                </Link>

                <div className='flex gap-4 items-center'>
                    {/* Search */}
                    <div ref={desktopSearchRef} className="relative">
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                            <input
                                type="text"
                                placeholder="Search handle..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
                                className="pl-9 pr-8 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent w-60 bg-gray-50 focus:bg-white transition"
                            />
                            {/* Search Icon */}
                            <svg className="w-4 h-4 absolute left-3 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {/* Spinner or Clear */}
                            {loadingSuggestions ? (
                                <span className="absolute right-3 text-xs text-gray-400 animate-spin">⟳</span>
                            ) : search ? (
                                <button type="button" onClick={() => setSearch("")} className="absolute right-3 text-gray-400 hover:text-gray-600 text-xs">✕</button>
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

                    {pathname !== '/generate' && (
                        <Link href="/generate">
                            <button className="bg-gray-900 hover:bg-gray-800 text-white px-5 py-2 rounded-full font-semibold text-sm transition shadow-sm hover:shadow">
                                Create Yours →
                            </button>
                        </Link>
                    )}
                </div>
            </nav>

            {/* ── MOBILE NAVBAR ── */}
            <nav className='md:hidden fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-3 sm:px-4 h-14 flex justify-between items-center'>
                {mobileSearchOpen ? (
                    // Full-width search header mode on mobile
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
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-9 pr-8 py-2 bg-gray-100 border border-transparent focus:border-green-600 focus:bg-white rounded-full text-sm focus:outline-none transition"
                            />
                            {search && (
                                <button type="button" onClick={() => setSearch("")} className="absolute right-3 text-gray-400 hover:text-gray-600 text-xs">
                                    ✕
                                </button>
                            )}
                        </form>
                        <button
                            type="button"
                            onClick={() => { setMobileSearchOpen(false); setShowDropdown(false); setSearch(""); }}
                            className="text-xs font-semibold text-gray-600 hover:text-black px-2 py-1"
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    // Standard header mode on mobile
                    <>
                        <Link href="/" className="flex shrink-0 items-center">
                            <Logo className="h-auto w-[120px] max-[360px]:w-[96px]" />
                        </Link>

                        <div className="flex shrink-0 items-center gap-1">
                            {/* Prominent Search Button on Mobile */}
                            <button
                                onClick={() => { setMobileSearchOpen(true); setMobileMenuOpen(false); }}
                                className="flex shrink-0 items-center gap-1.5 px-2.5 min-[380px]:px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-xs font-semibold transition"
                                aria-label="Search profiles"
                            >
                                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                                <span className="hidden min-[380px]:inline">Search</span>
                            </button>

                            {/* Create Yours button on Mobile Header (if not on /generate) */}
                            {pathname !== '/generate' && (
                                <Link
                                    href="/generate"
                                    className="inline-flex shrink-0 items-center whitespace-nowrap bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs font-semibold leading-none transition"
                                >
                                    Create
                                </Link>
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

            {/* ── MOBILE SEARCH DROPDOWN (when search is open in header) ── */}
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
                    {/* Embedded search inside drawer */}
                    <div>
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Search Profiles</p>
                        <form onSubmit={handleSearchSubmit} className="relative flex items-center">
                            <svg className="w-4 h-4 absolute left-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                placeholder="Type a handle (e.g. ayush)..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-9 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent"
                            />
                            <button type="submit" className="absolute right-3 text-gray-400 hover:text-black">
                                →
                            </button>
                        </form>

                        {/* Drawer Suggestions */}
                        {showDropdown && suggestions.length > 0 && (
                            <div className="mt-2 bg-gray-50 border border-gray-200 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                {suggestions.map((user) => (
                                    <button
                                        key={user.Handle}
                                        type="button"
                                        onClick={() => navigate(`/${user.Handle}`)}
                                        className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-white text-left transition"
                                    >
                                        {user.Picture ? (
                                            <img src={user.Picture} alt={user.Handle} className="h-7 w-7 rounded-full object-cover flex-shrink-0" />
                                        ) : (
                                            <div className="h-7 w-7 rounded-full bg-purple-200 text-purple-800 flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                {user.Handle[0].toUpperCase()}
                                            </div>
                                        )}
                                        <span className="text-sm font-medium text-gray-800">@{user.Handle}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex flex-col gap-2">
                        <Link
                            href="/"
                            onClick={() => setMobileMenuOpen(false)}
                            className="px-4 py-2.5 rounded-xl font-semibold text-sm text-gray-700 hover:bg-gray-100 transition flex items-center justify-between"
                        >
                            <span>Home</span>
                            <span>→</span>
                        </Link>

                        {pathname !== '/generate' && (
                            <Link
                                href="/generate"
                                onClick={() => setMobileMenuOpen(false)}
                                className="w-full"
                            >
                                <button className="w-full bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-xl font-semibold text-sm transition shadow">
                                    Create Your LinkPilot →
                                </button>
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar