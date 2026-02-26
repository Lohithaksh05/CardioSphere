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

  const [form, setForm] = useState({
    title: "",
    content: "",
    image_url: "",
    tags: "",
  });

  const fetchPosts = useCallback(async () => {
    try {
      const res = await getPosts();
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleCreatePost = async () => {
    if (!form.title || !form.content) return;
    setSubmitting(true);
    try {
      await createPost({
        title: form.title,
        content: form.content,
        image_url: form.image_url || null,
        tags: form.tags ? form.tags.split(",").map((t) => t.trim()) : [],
      });
      setForm({ title: "", content: "", image_url: "", tags: "" });
      setShowEditor(false);
      await fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await toggleLike(postId);
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComment = async (postId: string) => {
    const text = commentText[postId];
    if (!text?.trim()) return;
    try {
      await addComment(postId, text);
      setCommentText({ ...commentText, [postId]: "" });
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (postId: string) => {
    try {
      await deletePost(postId);
      await fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Users className="h-10 w-10 text-rose-500 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Community</h1>
          <p className="text-muted-foreground mt-1">
            Share experiences and support each other
          </p>
        </div>
        <Button onClick={() => setShowEditor(!showEditor)} className="gap-2">
          {showEditor ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showEditor ? "Cancel" : "New Post"}
        </Button>
      </div>

      {/* Post editor */}
      <AnimatePresence>
        {showEditor && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card className="border-rose-200 bg-rose-50/30">
              <CardHeader>
                <CardTitle className="text-lg">Create Post</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    placeholder="Share your health journey..."
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Content *</Label>
                  <Textarea
                    placeholder="Tell your story, share tips, or ask questions..."
                    value={form.content}
                    onChange={(e) => setForm({ ...form, content: e.target.value })}
                    rows={5}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Image URL (optional)</Label>
                    <Input
                      placeholder="https://..."
                      value={form.image_url}
                      onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tags</Label>
                    <Input
                      placeholder="diet, exercise, recovery..."
                      value={form.tags}
                      onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    />
                  </div>
                </div>
                <Button onClick={handleCreatePost} disabled={submitting} className="gap-2">
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  Publish
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
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  {/* Author */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={post.user_image} />
                        <AvatarFallback>
                          {(post.user_name || "A").charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{post.user_name}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(post.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    {post.user_id === user?.id && (
                      <Button
                        variant="ghost" size="icon"
                        onClick={() => handleDelete(post.id)}
                        className="text-red-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
                    {post.content}
                  </p>

                  {/* Image */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="mt-4 rounded-lg w-full max-h-80 object-cover"
                    />
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {post.tags.map((tag: string, j: number) => (
                        <Badge key={j} variant="secondary" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-4 mt-4">
                    <Button
                      variant="ghost" size="sm"
                      onClick={() => handleLike(post.id)}
                      className="gap-1.5 text-muted-foreground hover:text-rose-600"
                    >
                      <Heart className="h-4 w-4" /> {post.likes}
                    </Button>
                    <Button
                      variant="ghost" size="sm"
                      onClick={() =>
                        setExpandedPost(expandedPost === post.id ? null : post.id)
                      }
                      className="gap-1.5 text-muted-foreground"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {post.comments?.length || 0} Comments
                    </Button>
                  </div>

                  {/* Comments section */}
                  <AnimatePresence>
                    {expandedPost === post.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <Separator className="my-4" />

                        {/* Existing comments */}
                        {post.comments?.length > 0 && (
                          <div className="space-y-3 mb-4">
                            {post.comments.map((comment: any, k: number) => (
                              <div key={k} className="flex gap-3">
                                <Avatar className="h-7 w-7">
                                  <AvatarImage src={comment.user_image} />
                                  <AvatarFallback className="text-xs">
                                    {(comment.user_name || "A").charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 rounded-lg bg-gray-50 p-3">
                                  <div className="flex items-center gap-2">
                                    <p className="text-xs font-medium">{comment.user_name}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {new Date(comment.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <p className="text-sm mt-1">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Add comment */}
                        <div className="flex gap-2">
                          <Input
                            placeholder="Write a comment..."
                            value={commentText[post.id] || ""}
                            onChange={(e) =>
                              setCommentText({ ...commentText, [post.id]: e.target.value })
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleComment(post.id);
                            }}
                          />
                          <Button
                            size="icon"
                            onClick={() => handleComment(post.id)}
                          >
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
        <Card className="flex flex-col items-center justify-center h-48 text-muted-foreground">
          <Users className="h-12 w-12 mb-3 opacity-20" />
          <p>No posts yet. Be the first to share!</p>
          <Button variant="link" onClick={() => setShowEditor(true)}>
            Create a post
          </Button>
        </Card>
      )}
    </div>
  );
}
