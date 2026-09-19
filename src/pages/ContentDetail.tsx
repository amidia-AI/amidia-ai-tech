import React, { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Target, BookOpen, Check } from 'lucide-react';
import { getFirebaseDb } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { Content } from '../types';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [content, setContent] = useState<Content | null>(null);
  const [progress, setProgress] = useState<boolean[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContentAndProgress = async () => {
      if (!id) return;
      try {
        const db = await getFirebaseDb();
        const contentRef = doc(db, 'content', id);
        const contentSnap = await getDoc(contentRef);
        
        if (contentSnap.exists()) {
          const contentData = { id: contentSnap.id, ...contentSnap.data() } as Content;
          setContent(contentData);

          if (contentData.type === 'challenge' && contentData.checklist) {
            let userProgress = new Array(contentData.checklist.length).fill(false);
            
            if (user) {
              const progressRef = doc(db, 'users', user.uid, 'progress', id);
              const progressSnap = await getDoc(progressRef);
              if (progressSnap.exists()) {
                const data = progressSnap.data();
                if (data && data.checklistState) {
                  userProgress = data.checklistState;
                }
              }
            }
            setProgress(userProgress);
          }
        }
      } catch (error) {
        console.error("Error fetching content detail:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContentAndProgress();
  }, [id, user]);

  const toggleChecklist = async (index: number) => {
    if (!content || !user || !id) {
      alert("Please sign in to save your progress.");
      return;
    }

    const newProgress = [...progress];
    newProgress[index] = !newProgress[index];
    setProgress(newProgress);

    try {
      const db = await getFirebaseDb();
      const progressRef = doc(db, 'users', user.uid, 'progress', id);
      await setDoc(progressRef, {
        checklistState: newProgress
      }, { merge: true });
    } catch (error) {
      console.error("Error updating progress:", error);
      // Revert on failure
      const reverted = [...newProgress];
      reverted[index] = !reverted[index];
      setProgress(reverted);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] text-neutral-900 flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-neutral-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-[#f8f9fc] text-neutral-900 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Content not found</h1>
        <Link to="/" className="text-blue-600 hover:underline">Return to Library</Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#f8f9fc] text-neutral-900 flex flex-col justify-between overflow-x-hidden">
      <Navbar />
      <main className="relative z-10 flex-1 flex flex-col pt-24 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-neutral-500 hover:text-neutral-900 transition-colors mb-12 font-medium">
            <ArrowLeft className="w-4 h-4" />
            Back to Library
          </Link>

        <div className="bg-white rounded-[32px] p-8 sm:p-12 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-neutral-100 mb-12">
          <div className="bg-neutral-50 inline-flex px-3 py-1.5 rounded-full border border-neutral-200 items-center gap-1.5 mb-8">
            {content.type === 'challenge' ? (
              <Target className="w-3.5 h-3.5 text-blue-600" />
            ) : (
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
            )}
            <span className="text-xs font-bold text-neutral-800 tracking-wide uppercase">
              {content.coverTag}
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-neutral-950 mb-6 leading-tight">
            {content.title}
          </h1>

          <div className="prose prose-neutral prose-lg max-w-none text-neutral-600 leading-relaxed">
            <p className="whitespace-pre-wrap">{content.description}</p>
          </div>

          {content.type === 'challenge' && content.checklist && content.checklist.length > 0 && (
            <div className="mt-12 pt-12 border-t border-neutral-100">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6 flex items-center gap-3">
                <Target className="w-6 h-6 text-neutral-900" />
                Challenge Checklist
              </h2>
              
              {!user && (
                <div className="bg-blue-50/50 text-blue-800 p-4 rounded-xl text-sm font-medium mb-6">
                  Sign in to save your progress and track completed items.
                </div>
              )}

              <div className="space-y-3">
                {content.checklist.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => toggleChecklist(idx)}
                    className={`w-full flex items-start gap-4 p-4 sm:p-5 rounded-2xl text-left transition-all border ${
                      progress[idx] 
                        ? 'bg-neutral-50/80 border-neutral-200 shadow-inner' 
                        : 'bg-white border-neutral-200 shadow-sm hover:shadow-md hover:border-blue-200'
                    }`}
                  >
                    <div className={`mt-0.5 shrink-0 flex items-center justify-center w-6 h-6 rounded-full border transition-colors ${
                      progress[idx] 
                        ? 'bg-neutral-900 border-neutral-900 text-white' 
                        : 'bg-transparent border-neutral-300 text-transparent'
                    }`}>
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span className={`text-base font-medium transition-all ${
                      progress[idx] ? 'text-neutral-400 line-through' : 'text-neutral-800'
                    }`}>
                      {item.step}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {content.resources && content.resources.length > 0 && (
            <div className="mt-12 pt-12 border-t border-neutral-100">
              <h2 className="text-xl font-bold text-neutral-900 mb-6">Resources</h2>
              <ul className="space-y-3">
                {content.resources.map((res, idx) => (
                  <li key={idx}>
                    {res.startsWith('http') ? (
                      <a href={res} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">
                        {res}
                      </a>
                    ) : (
                      <span className="text-neutral-700">{res}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      </main>
      <Footer />
    </div>
  );
}
