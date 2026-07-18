"use client";

import { useState, useEffect } from "react";
import { Comment, getComments, createComment } from "@/lib/api";

interface CommentSectionProps {
  matchId: number;
}

export function CommentSection({ matchId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadComments = async () => {
      setLoading(true);
      setLoadError(null);
      try {
        const result = await getComments(matchId);
        setComments(result.data);
      } catch {
        setLoadError("无法加载评论");
      } finally {
        setLoading(false);
      }
    };
    loadComments();
  }, [matchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    try {
      await createComment({
        matchId,
        userName: "用户",
        content: content.trim(),
      });
      setContent("");
      setSubmitSuccess(true);
      const result = await getComments(matchId);
      setComments(result.data);
    } catch {
      setSubmitError("评论提交失败，请稍后重试");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
      <h3 className="mb-4 text-lg font-semibold text-slate-900">
        评论互动 ({comments.length})
      </h3>

      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setSubmitSuccess(false);
            setSubmitError(null);
          }}
          placeholder="发表你的看法..."
          className="mb-3 w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">{content.length}/500</span>
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "提交中..." : "发表评论"}
          </button>
        </div>
      </form>

      {submitSuccess && (
        <div className="mb-4 rounded-lg bg-emerald-100 p-4 text-emerald-800">
          评论发表成功
        </div>
      )}

      {submitError && (
        <div className="mb-4 rounded-lg bg-rose-100 p-4 text-rose-800">
          {submitError}
        </div>
      )}

      {loadError && (
        <div className="mb-4 rounded-lg bg-rose-100 p-4 text-rose-800">
          {loadError}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-slate-500">
          暂无评论，快来发表第一条评论吧！
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="border-t border-slate-200 pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex items-center justify-center rounded-full bg-slate-100">
                  <span className="text-lg">{comment.userName[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-slate-900">
                    {comment.userName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(comment.createdAt).toLocaleString("zh-CN")}
                  </p>
                </div>
              </div>
              <p className="mt-2 text-slate-700">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
