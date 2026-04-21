"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface FeedPost {
  id?: string;
  title: string;
  content: string;
  published_at?: string;
  publishedAt?: string;
  representative_image_id?: number;
  blog_title?: string;
  writer_nickname?: string;
  author?: string;
  blog?: { title: string; slug: string };
  tags?: string[];
}

interface Notification {
  id: string;
  type: string;
  message: string;
  targetUrl: string;
  isRead: boolean;
  createdAt: string;
}

export default function MainPage() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [sidebarTab, setSidebarTab] = useState<"news" | "activity" | "universe">("news");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFeed() {
      setLoading(true);
      try {
        if (session?.user) {
          const res = await fetch("/api/feeds/universe");
          if (res.ok) {
            const data = await res.json();
            setPosts(data.posts || []);
          } else {
            const fallback = await fetch("/api/posts?limit=10");
            if (fallback.ok) {
              const data = await fallback.json();
              setPosts(data.posts || []);
            }
          }
        } else {
          const res = await fetch("/api/posts?limit=10");
          if (res.ok) {
            const data = await res.json();
            setPosts(data.posts || []);
          }
        }
      } catch (error) {
        console.error("피드 로딩 실패:", error);
      }
      setLoading(false);
    }

    if (status !== "loading") {
      fetchFeed();
    }
  }, [session, status]);

  useEffect(() => {
    async function fetchNotifications() {
      if (!session?.user) return;
      try {
        const res = await fetch(`/api/users/${session.user.id}/notifications?limit=5`);
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } catch (error) {
        console.error("알림 로딩 실패:", error);
      }
    }
    fetchNotifications();
  }, [session]);

  const getContentPreview = (content: string) => {
    const text = content.replace(/<[^>]*>/g, "");
    return text.length > 100 ? text.substring(0, 100) + "..." : text;
  };

  const getAuthor = (post: FeedPost) => {
    return post.writer_nickname || post.author || "";
  };

  const getBlogTitle = (post: FeedPost) => {
    return post.blog_title || post.blog?.title || "";
  };

  return (
    <div className="max-w-[1200px] mx-auto px-6 py-8 flex gap-8">
      {/* Left: Feed */}
      <div className="flex-1 min-w-0">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-[400px]">
            <input
              type="text"
              placeholder="검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 px-4 pr-10 border border-border rounded text-sm focus:outline-none focus:border-primary"
            />
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Feed Title */}
        <h2 className="text-xl font-bold mb-4">유니버스 새 글</h2>

        {/* Feed Posts */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-5 animate-pulse"
              >
                <div className="h-5 bg-muted-bg rounded w-1/3 mb-3" />
                <div className="h-3 bg-muted-bg rounded w-full mb-2" />
                <div className="h-3 bg-muted-bg rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-muted text-sm py-10 text-center">
            {session?.user
              ? "이웃의 새 글이 없습니다. 이웃을 추가해보세요!"
              : "게시글이 없습니다."}
          </div>
        ) : (
          <div className="space-y-4">
            {posts.map((post, idx) => (
              <article
                key={post.id || idx}
                className="border border-border rounded-lg p-5 hover:shadow-sm transition-shadow"
              >
                <div className="flex gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-base mb-2 truncate">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted leading-relaxed">
                      {getContentPreview(post.content)}
                    </p>
                    {getAuthor(post) && (
                      <p className="text-xs text-muted mt-2">
                        {getAuthor(post)}
                        {getBlogTitle(post) && ` - ${getBlogTitle(post)}`}
                      </p>
                    )}
                  </div>
                  {post.representative_image_id ? (
                    <div className="w-16 h-16 bg-muted-bg rounded flex items-center justify-center text-xs text-muted shrink-0">
                      이미지
                    </div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {/* Right: Sidebar */}
      {session?.user && (
        <aside className="w-[240px] shrink-0 hidden lg:block">
          {/* Profile Card */}
          <div className="border border-border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full bg-muted-bg flex items-center justify-center text-muted text-xl">
                {session.user.nickname?.charAt(0) ||
                  session.user.name?.charAt(0) ||
                  "?"}
              </div>
              <div>
                <p className="font-bold text-sm">
                  {session.user.nickname || session.user.name}
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex border-b border-border">
              <button
                onClick={() => setSidebarTab("news")}
                className={`flex-1 py-2 text-xs text-center cursor-pointer ${
                  sidebarTab === "news"
                    ? "bg-primary-bg font-bold"
                    : "hover:bg-muted-bg"
                }`}
              >
                내 소식
              </button>
              <button
                onClick={() => setSidebarTab("activity")}
                className={`flex-1 py-2 text-xs text-center cursor-pointer ${
                  sidebarTab === "activity"
                    ? "bg-primary-bg font-bold"
                    : "hover:bg-muted-bg"
                }`}
              >
                내 활동
              </button>
              <button
                onClick={() => setSidebarTab("universe")}
                className={`flex-1 py-2 text-xs text-center cursor-pointer ${
                  sidebarTab === "universe"
                    ? "bg-primary-bg font-bold"
                    : "hover:bg-muted-bg"
                }`}
              >
                유니버스
              </button>
            </div>

            <div className="p-3 min-h-[150px]">
              {sidebarTab === "news" && (
                <div>
                  {notifications.length === 0 ? (
                    <p className="text-xs text-muted">새로운 소식이 없습니다.</p>
                  ) : (
                    <ul className="space-y-2">
                      {notifications.map((noti) => (
                        <li key={noti.id}>
                          <Link
                            href={noti.targetUrl || "#"}
                            className="block text-xs text-foreground hover:bg-muted-bg rounded p-2 leading-relaxed"
                          >
                            {noti.message}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
              {sidebarTab === "activity" && (
                <p className="text-xs text-muted">최근 활동이 없습니다.</p>
              )}
              {sidebarTab === "universe" && (
                <p className="text-xs text-muted">
                  <Link href="/settings/universe" className="text-primary hover:underline">
                    나의 유니버스 관리
                  </Link>
                </p>
              )}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
