import React, { useState, useEffect } from 'react';
import { Heart, MessageCircle, Send, LogOut, User } from 'lucide-react';

const SocialMediaApp = () => {
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState('');
  const [emoji, setEmoji] = useState('😊');
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

  const emojis = ['😊', '😎', '🥳', '🤩', '😇', '🤗', '😺', '🦁', '🐼', '🦊', '🐨', '🐯'];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const userResult = await window.storage.get('current_user');
      if (userResult) {
        setUser(JSON.parse(userResult.value));
      }

      try {
        const postsResult = await window.storage.get('all_posts', true);
        if (postsResult) {
          setPosts(JSON.parse(postsResult.value));
        }
      } catch (error) {
        console.log('No posts yet');
        setPosts([]);
      }
    } catch (error) {
      console.log('No user data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (username.trim()) {
      const newUser = { username: username.trim(), emoji };
      setUser(newUser);
      await window.storage.set('current_user', JSON.stringify(newUser));
    }
  };

  const handleLogout = async () => {
    setUser(null);
    await window.storage.delete('current_user');
  };

  const handlePost = async () => {
    if (newPost.trim()) {
      const post = {
        id: Date.now(),
        author: user.username,
        emoji: user.emoji,
        content: newPost.trim(),
        likes: [],
        comments: [],
        timestamp: new Date().toISOString()
      };

      const updatedPosts = [post, ...posts];
      setPosts(updatedPosts);
      try {
        await window.storage.set('all_posts', JSON.stringify(updatedPosts), true);
      } catch (error) {
        console.error('Error saving post:', error);
      }
      setNewPost('');
    }
  };

  const handleLike = async (postId) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const likes = post.likes.includes(user.username)
          ? post.likes.filter(u => u !== user.username)
          : [...post.likes, user.username];
        return { ...post, likes };
      }
      return post;
    });
    setPosts(updatedPosts);
    try {
      await window.storage.set('all_posts', JSON.stringify(updatedPosts), true);
    } catch (error) {
      console.error('Error saving like:', error);
    }
  };

  const handleComment = async (postId, comment) => {
    if (comment.trim()) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, {
              author: user.username,
              emoji: user.emoji,
              text: comment.trim(),
              timestamp: new Date().toISOString()
            }]
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      try {
        await window.storage.set('all_posts', JSON.stringify(updatedPosts), true);
      } catch (error) {
        console.error('Error saving comment:', error);
      }
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'ئێستا';
    if (diff < 3600) return `${Math.floor(diff / 60)} خولەک پێش ئێستا`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} کاتژمێر پێش ئێستا`;
    return `${Math.floor(diff / 86400)} ڕۆژ پێش ئێستا`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center">
        <div className="text-2xl text-purple-600">چاوەڕوان بە...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-purple-600 mb-2">بەخێربێیت! 👋</h1>
            <p className="text-gray-600">چوونەژوورەوە بۆ پلاتفۆرمی سۆشیال میدیا</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ناوی بەکارهێنەر</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ناوەکەت بنووسە..."
                className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ئیمۆجیەکەت هەڵبژێرە</label>
              <div className="grid grid-cols-6 gap-2">
                {emojis.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmoji(e)}
                    className={`text-3xl p-3 rounded-xl transition-all ${
                      emoji === e ? 'bg-purple-100 scale-110 shadow-lg' : 'hover:bg-gray-100'
                    }`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            
            <button
              onClick={handleLogin}
              disabled={!username.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              دەستپێکردن
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl">{user.emoji}</span>
            <span className="font-bold text-xl text-purple-600">{user.username}</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
          >
            <LogOut size={20} />
            دەرچوون
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-4 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="چی لە بیرتدایە؟ 💭"
            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none resize-none transition-colors"
            rows="3"
          />
          <button
            onClick={handlePost}
            disabled={!newPost.trim()}
            className="mt-4 w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-xl font-semibold hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Send size={20} />
            بڵاوکردنەوە
          </button>
        </div>

        {posts.map(post => (
          <PostCard
            key={post.id}
            post={post}
            currentUser={user}
            onLike={handleLike}
            onComment={handleComment}
            formatTime={formatTime}
          />
        ))}

        {posts.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <User size={64} className="mx-auto mb-4 opacity-50" />
            <p className="text-xl">هێشتا هیچ پۆستێک نییە</p>
            <p className="text-sm mt-2">یەکەمین کەس بە بۆ شتێک بڵاوبکەیتەوە!</p>
          </div>
        )}
      </div>
    </div>
  );
};

const PostCard = ({ post, currentUser, onLike, onComment, formatTime }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const handleSubmitComment = () => {
    if (commentText.trim()) {
      onComment(post.id, commentText);
      setCommentText('');
    }
  };

  const isLiked = post.likes.includes(currentUser.username);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">{post.emoji}</span>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-purple-600">{post.author}</h3>
            <p className="text-sm text-gray-500">{formatTime(post.timestamp)}</p>
          </div>
        </div>

        <p className="text-gray-800 text-lg mb-4 leading-relaxed">{post.content}</p>

        <div className="flex items-center gap-6 border-t border-b border-gray-100 py-3">
          <button
            onClick={() => onLike(post.id)}
            className={`flex items-center gap-2 transition-all ${
              isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
            }`}
          >
            <Heart size={20} fill={isLiked ? 'currentColor' : 'none'} />
            <span className="font-semibold">{post.likes.length}</span>
          </button>
          
          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors"
          >
            <MessageCircle size={20} />
            <span className="font-semibold">{post.comments.length}</span>
          </button>
        </div>

        {showComments && (
          <div className="mt-4 space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="کۆمێنتێک بنووسە..."
                className="flex-1 px-4 py-2 border-2 border-purple-200 rounded-lg focus:border-purple-500 focus:outline-none"
                onKeyPress={(e) => e.key === 'Enter' && handleSubmitComment()}
              />
              <button
                onClick={handleSubmitComment}
                disabled={!commentText.trim()}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>

            <div className="space-y-3">
              {post.comments.map((comment, idx) => (
                <div key={idx} className="flex gap-3 bg-gray-50 rounded-lg p-3">
                  <span className="text-2xl">{comment.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-purple-600">{comment.author}</span>
                      <span className="text-xs text-gray-400">{formatTime(comment.timestamp)}</span>
                    </div>
                    <p className="text-gray-700">{comment.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SocialMediaApp;