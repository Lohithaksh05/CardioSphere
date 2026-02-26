"use client";

import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useUser } from "@clerk/nextjs";
import {
  Users, Plus, Heart, MessageCircle, Send, Loader2, X, Trash2, Clock,
} from "lucide-react";
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  getPosts, createPost, addComment, toggleLike, deletePost,
} from "@/lib/api";

export default function CommunityPage() {
  const { user } = useUser();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [commentText, setCommentText] = useState<Record<string, string>>({});
  const [expandedPost, setExpandedPost] = useState<string | null>(null);

  const [form, setForm] = useState({ title: "", content: "", image_url: "", tags: "" });

  const fetchPosts = useCallback(async () => {
    try { const res = await getPosts(); setPosts(res.data); } catch (err) { console.error(err); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try {
      await createPost({ title: form.title, content: form.content, image_url: form.image_url || null, tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [] });
      setForm({ title: "", content: "", image_url: "", tags: "" });
      setShowEditor(false); await fetchPosts();
    } catch (err) { console.error(err); } finally { setSubmitting(false); }
  };

  const handleLike = async (postId: string) => { try { await toggleLike(postId); await fetchPosts(); } catch (err) { console.error(err); } };
  const handleComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try { await addComment(postId, text); setCommentText({ ...commentText, [postId]: "" }); await fetchPosts(); } catch (err) { console.error(err); }
  };
  const handleDelete = async (postId: string) => { try { await deletePost(postId); await fetchPosts(); } catch (err) { console.error(err); } };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-200/50 animate-pulse">
          <Users className="h-8 w-8 text-white" />
        </div>
        <p className="text-sm text-muted-foreground">Loading community...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text-subtle">Community</h1>
          <p className="text-muted-foreground mt-1">Share experiences and support each other</p>
        </div>
        <Button onClick={() => setShowEditor(!showEditor)}
          className={`gap-2 rounded-xl shadow-lg transition-all ${showEditor ? "bg-gray-600 hover:bg-gray-700" : "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-200/50"}`}>
          {showEditor ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showEditor ? "Cancel" : "New Post"}
        </Button>
      </div>

      {/* Post editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
            <Card className="glass-card rounded-2xl border-0 overflow-hidden">
              <div className="h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-orange-600"><Send className="h-4 w-4 text-white" /></div>
                  Create Post
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Title *</Label>
                  <Input placeholder="Share your health journey..." value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-medium">Content *</Label>
                  <Textarea placeholder="Tell your story, share tips, or ask questions..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={5} className="rounded-xl border-gray-200 bg-white/80" />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Image URL (optional)</Label>
                    <Input placeholder="https://..." value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-gray-700 font-medium">Tags</Label>
                    <Input placeholder="diet, exercise, recovery..." value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="rounded-xl border-gray-200 h-11 bg-white/80" />
                  </div>
                </div>
                <Button onClick={handleCreatePost} disabled={submitting}
                  className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-lg shadow-amber-200/50 hover:shadow-xl transition-all">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Publish
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Posts list */}
      {posts.length > 0 ? (
        <div className="space-y-4">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card-hover rounded-2xl border-0 overflow-hidden">
                <CardContent className="p-6">
                  {/* Author */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-11 w-11 ring-2 ring-white shadow-md">
                        <AvatarImage src={post.user_image} />
                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-orange-500 text-white font-bold">
                          {(post.user_name || "A").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{post.user_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    {post.user_id === user?.id && (
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(post.id)} className="rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">{post.content}</p>

                  {post.image_url && (
                    <img src={post.image_url} alt={post.title} className="mt-4 rounded-xl w-full max-h-80 object-cover shadow-md" />
                  )}

                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-xs rounded-lg bg-amber-50 text-amber-700 border-0">#{tag}</Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => handleLike(post.id)}
                      className="gap-1.5 rounded-xl text-muted-foreground hover:text-rose-600 hover:bg-rose-50">
                      <Heart className="h-4 w-4" /> {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm"
                      onClick={() => setExpandedPost(expandedPost === post.id ? null : post.id)}
                      className="gap-1.5 rounded-xl text-muted-foreground hover:text-blue-600 hover:bg-blue-50">
                      <MessageCircle className="h-4 w-4" /> {post.comments?.length || 0} Comments
                    </Button>
                  </div>

                  {/* Comments section */}
                  <AnimatePresence>
                    {expandedPost === post.id && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <Separator className="my-4" />
                        {post.comments?.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {post.comments.map((comment: any, k: number) => (
                              <div key={k} className="flex gap-3">
                                <Avatar className="h-8 w-8 ring-1 ring-white shadow-sm">
                                  <AvatarImage src={comment.user_image} />
                                  <AvatarFallback className="text-xs bg-gradient-to-br from-gray-200 to-gray-300">{(comment.user_name || "A").charAt(0)}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 rounded-xl bg-white/60 backdrop-blur-sm p-3 border border-white/20">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-semibold">{comment.user_name}</p>
                                    <p className="text-xs text-muted-foreground">{new Date(comment.created_at).toLocaleDateString()}</p>
                                  </div>
                                  <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        <div className="flex gap-2">
                          <Input placeholder="Write a comment..." value={commentText[post.id] || ""}
                            onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                            onKeyDown={(e) => { if (e.key === "Enter") handleComment(post.id); }}
                            className="rounded-xl border-gray-200 bg-white/80" />
                          <Button size="icon" onClick={() => handleComment(post.id)}
                            className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 shadow-lg shadow-amber-200/50">
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : (
        <Card className="glass-card rounded-2xl border-0 flex flex-col items-center justify-center h-52 text-muted-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-orange-100 mb-4">
            <Users className="h-8 w-8 text-amber-400" />
          </div>
          <p className="font-medium">No posts yet. Be the first to share!</p>
          <Button variant="link" onClick={() => setShowEditor(true)} className="text-amber-600">Create a post</Button>
        </Card>
      )}
    </div>
  );
}