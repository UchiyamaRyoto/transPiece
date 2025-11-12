'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

type ApiSource = 'gutendex' | 'openlibrary' | 'google';
type Book = {
    id: string;
    title: string;
    authors: string[];
    languages: string[];
    downloads: number;
    coverUrl?: string;
    textUrl?: string;
    source: string;
};

export default function BookSearchPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [nextUrl, setNextUrl] = useState<string | null>(null);
    const [prevUrl, setPrevUrl] = useState<string | null>(null);
    const [selectedApis, setSelectedApis] = useState<ApiSource[]>(['gutendex']);
    const [pagination, setPagination] = useState<{
        gutendex?: { next: string | null; prev: string | null };
        openlibrary?: { page: number; totalPages: number };
        google?: { startIndex: number; totalItems: number };
    }>({});
    const router = useRouter();

    // API切り替え
    const toggleApi = (api: ApiSource) => {
        setSelectedApis((prev) =>
            prev.includes(api) ? prev.filter((a) => a !== api) : [...prev, api]
        );
    };

    // API から本を取得
    const fetchBooksFromApi = async (api: ApiSource, q: string, pageArg?: any) => {
        try {
            if (api === 'gutendex') {
                const url = typeof pageArg === "string"
                    ? pageArg
                    : `https://gutendex.com/books?search=${q}&languages=en`;
                const res = await fetch(url);
                const data = await res.json();
                setPagination((prev) => ({
                    ...prev,
                    gutendex: { next: data.next, prev: data.previous }
                }));
                return data.results.map((b: any) => ({
                    id: `gutendex-${b.id}`,
                    title: b.title,
                    authors: b.authors.map((a: any) => a.name),
                    languages: b.languages,
                    downloads: b.download_count,
                    coverUrl: b.formats["image/jpeg"],
                    textUrl: b.formats["text/plain; charset=us-ascii"] || b.formats["text/plain"],
                    source: "gutendex"
                }));
            }

            if (api === 'openlibrary') {
                const page = typeof pageArg === "number" ? pageArg : 1;
                const res = await fetch(`https://openlibrary.org/search.json?q=${q}&page=${page}`);
                const data = await res.json();
                setPagination((prev) => ({
                    ...prev,
                    openlibrary: { page, totalPages: Math.ceil(data.numFound / 100) }
                }));
                return data.docs.map((b: any) => ({
                    id: `openlib-${b.key}`,
                    title: b.title,
                    authors: b.author_name || [],
                    languages: b.language || [],
                    downloads: 0,
                    coverUrl: b.cover_i
                        ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg`
                        : null,
                    textUrl: null, // OpenLibrary は直接テキスト提供しない
                    source: "openlibrary"
                }));
            }

            if (api === 'google') {
                const startIndex = typeof pageArg === "number" ? pageArg : 0;
                const maxResults = 10;
                const res = await fetch(
                    `https://www.googleapis.com/books/v1/volumes?q=${q}&startIndex=${startIndex}&maxResults=${maxResults}`
                );
                const data = await res.json();
                setPagination((prev) => ({
                    ...prev,
                    google: { startIndex, totalItems: data.totalItems }
                }));
                return (data.items || []).map((b: any) => ({
                    id: `google-${b.id}`,
                    title: b.volumeInfo.title,
                    authors: b.volumeInfo.authors || [],
                    languages: b.volumeInfo.language ? [b.volumeInfo.language] : [],
                    downloads: 0,
                    coverUrl: b.volumeInfo.imageLinks?.thumbnail,
                    textUrl: b.volumeInfo.previewLink,
                    source: "google"
                }));
            }
        } catch (err) {
            console.error(`${api} fetch error:`, err);
            return [];
        }
    };

    const handleSearch = async () => {
        if (!query || selectedApis.length === 0) return;
        setLoading(true);
        try {
            const allResults = await Promise.all(
                selectedApis.map(api => fetchBooksFromApi(api, query))
            );
            // すべて結合
            setResults(allResults.flat());
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSelectBook = (book: any) => {
        if (!book.textUrl) return alert("この書籍にはテキストがありません。");
        router.push(
            `/gutenberg/gutenbergView?` +
            `title=${encodeURIComponent(book.title)}` +
            `&url=${encodeURIComponent(book.textUrl)}` +
            `&authors=${encodeURIComponent(book.authors.join(', '))}` +
            `&downloads=${book.downloads || 0}` +
            `&lang=${encodeURIComponent(book.languages.join(', '))}` +
            `&source=${encodeURIComponent(book.source)}`
        );
    };

    // 書籍のカバー画像URLを取得する関数
    const getBookCoverUrl = (book: any) => {
        // イメージがあれば使用、なければプレースホルダー
        return book.formats["image/jpeg"] || '/book-placeholder.png';
    };

    // スケルトンローダー
    const BookSkeleton = () => (
        <div className="flex gap-4 p-4 border-b border-gray-100 dark:border-gray-700 animate-pulse">
            <div className="bg-gray-200 dark:bg-gray-700 w-16 h-24 rounded"></div>
            <div className="flex-1">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* ヘッダーセクション */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white mb-2">名著を検索</h1>
                    <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                        Gutenbergプロジェクトの膨大な電子書籍から、お好きな名著を見つけてください。
                    </p>
                </div>

                {/* API 選択チェックボックス */}
                <div className="flex gap-4 mb-4">
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedApis.includes('gutendex')}
                            onChange={() => toggleApi('gutendex')}
                        /> Gutendex
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedApis.includes('openlibrary')}
                            onChange={() => toggleApi('openlibrary')}
                        /> Open Library
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={selectedApis.includes('google')}
                            onChange={() => toggleApi('google')}
                        /> Google Books
                    </label>
                </div>
                {/* 検索フォーム */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <span className="ri-search-line text-gray-400"></span>
                        </div>
                        <input
                            type="text"
                            placeholder="著者名、タイトル、キーワードで検索..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-white transition"
                        />
                        <button
                            onClick={handleSearch}
                            className="absolute right-2 top-1.5 bg-indigo-600 text-white px-4 py-1.5 rounded-md hover:bg-indigo-700 transition"
                        >
                            検索
                        </button>
                    </div>
                </div>

                {/* 結果リスト */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                    {loading ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {[...Array(5)].map((_, i) => (
                                <BookSkeleton key={i} />
                            ))}
                        </div>
                    ) : results.length > 0 ? (
                        <div>
                            <ul className="divide-y divide-gray-100 dark:divide-gray-700">
                                {results.map((book) => (
                                    <li
                                        key={book.id}
                                        className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition group"
                                        onClick={() => handleSelectBook(book)}
                                    >
                                        <div className="flex gap-4">
                                            <div className="relative min-w-16 h-24 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                                                {book.coverUrl && (
                                                    <div
                                                        className="w-full h-full bg-center bg-cover"
                                                        style={{ backgroundImage: `url(${book.coverUrl})` }}
                                                    />
                                                )}
                                                {!book.coverUrl && (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-500">
                                                        <span className="ri-book-2-line text-3xl"></span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1">
                                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition line-clamp-1">
                                                    {book.title}
                                                </h2>
                                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                                    {book.authors.map((a: { name: string }) => a.name).join(', ') || '著者不明'}
                                                </p>
                                                <div className="flex gap-4 text-xs text-gray-500 dark:text-gray-400">
                                                    <div className="flex items-center">
                                                        <span className="ri-translate-2 mr-1"></span>
                                                        <span>{book.languages.join(', ').toUpperCase()}</span>
                                                    </div>
                                                    <div className="flex items-center">
                                                        <span className="ri-download-line mr-1"></span>
                                                        <span>{book.download_count ? book.download_count.toLocaleString() : 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="self-center text-gray-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <span className="ri-arrow-right-line"></span>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            {/* ページネーション */}
                            <div className="flex justify-between items-center p-4 border-t border-gray-100 dark:border-gray-700">
                                {/* Gutendex */}
                                {selectedApis.includes('gutendex') && pagination.gutendex && (
                                    <>
                                        <button
                                            disabled={!pagination.gutendex.prev}
                                            onClick={() => fetchBooksFromApi('gutendex', query, pagination.gutendex?.prev)}
                                        >
                                            前へ
                                        </button>
                                        <button
                                            disabled={!pagination.gutendex.next}
                                            onClick={() => fetchBooksFromApi('gutendex', query, pagination.gutendex?.next)}
                                        >
                                            次へ
                                        </button>
                                    </>
                                )}

                                {/* OpenLibrary */}
                                {selectedApis.includes('openlibrary') && pagination.openlibrary && (
                                    <>
                                        <button
                                            disabled={pagination.openlibrary.page <= 1}
                                            onClick={() =>
                                                fetchBooksFromApi('openlibrary', query, pagination.openlibrary!.page - 1)
                                            }
                                        >
                                            前へ
                                        </button>
                                        <button
                                            disabled={pagination.openlibrary.page >= pagination.openlibrary.totalPages}
                                            onClick={() =>
                                                fetchBooksFromApi('openlibrary', query, pagination.openlibrary!.page + 1)
                                            }
                                        >
                                            次へ
                                        </button>
                                    </>
                                )}

                                {/* Google */}
                                {selectedApis.includes('google') && pagination.google && (
                                    <>
                                        <button
                                            disabled={pagination.google.startIndex <= 0}
                                            onClick={() =>
                                                fetchBooksFromApi('google', query, pagination.google!.startIndex - 10)
                                            }
                                        >
                                            前へ
                                        </button>
                                        <button
                                            disabled={pagination.google.startIndex + 10 >= pagination.google.totalItems}
                                            onClick={() =>
                                                fetchBooksFromApi('google', query, pagination.google!.startIndex + 10)
                                            }
                                        >
                                            次へ
                                        </button>
                                    </>
                                )}
                            </div>                        </div>
                    ) : query ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 mb-4">
                                <span className="ri-search-line text-3xl text-gray-400 dark:text-gray-500"></span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">検索結果が見つかりません</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400">
                                別のキーワードや著者名で検索してみてください。
                            </p>
                        </div>
                    ) : (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 mb-4">
                                <span className="ri-book-open-line text-3xl text-indigo-600 dark:text-indigo-400"></span>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white">著名な書籍を探索</h3>
                            <p className="mt-2 text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                                世界中の名著や古典を見つけて読むことができます。
                                著者名やタイトルで検索を始めましょう。
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}