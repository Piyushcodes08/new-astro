import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  FaChevronLeft,
  FaChevronRight,
  FaCheck,
  FaPaperPlane,
  FaPlay,
  FaRegCommentDots,
  FaUser,
} from "react-icons/fa";
import {
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Navigation, Pagination } from "swiper/modules";

const QandASection = ({ courseName }) => {
  const previousButtonRef = useRef(null);
  const nextButtonRef = useRef(null);

  const [videos, setVideos] = useState([]);
  const [videosLoading, setVideosLoading] = useState(true);

  const [comments, setComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(true);

  const [newCommentName, setNewCommentName] = useState("");
  const [newCommentText, setNewCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // Fetch Q&A videos
  useEffect(() => {
    if (!courseName) {
      setVideos([]);
      setVideosLoading(false);
      return;
    }

    const fetchVideoDetails = async () => {
      setVideosLoading(true);

      try {
        const qandaRef = collection(db, "questionAndAnswer");
        const videosQuery = query(
          qandaRef,
          where("courseName", "==", courseName)
        );

        const querySnapshot = await getDocs(videosQuery);

        const fetchedVideos = querySnapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setVideos(fetchedVideos);
      } catch (error) {
        console.error("Error fetching Q&A videos:", error);
        setVideos([]);
      } finally {
        setVideosLoading(false);
      }
    };

    fetchVideoDetails();
  }, [courseName]);

  // Fetch comments in real time
  useEffect(() => {
    if (!courseName) {
      setComments([]);
      setCommentsLoading(false);
      return;
    }

    setCommentsLoading(true);

    const commentsRef = collection(db, "Comments_Vahaly_Astro");
    const commentsQuery = query(
      commentsRef,
      where("courseName", "==", courseName)
    );

    const unsubscribe = onSnapshot(
      commentsQuery,
      (snapshot) => {
        const fetchedComments = snapshot.docs.map((document) => ({
          id: document.id,
          ...document.data(),
        }));

        setComments(fetchedComments);
        setCommentsLoading(false);
      },
      (error) => {
        console.error("Error fetching comments:", error);
        setComments([]);
        setCommentsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [courseName]);

  // Display newest comments first
  const sortedComments = useMemo(() => {
    return [...comments].sort((first, second) => {
      const firstTime = first.timestamp?.toMillis?.() || 0;
      const secondTime = second.timestamp?.toMillis?.() || 0;

      return secondTime - firstTime;
    });
  }, [comments]);

  const handleCommentSubmit = async (event) => {
    event.preventDefault();

    const trimmedName = newCommentName.trim();
    const trimmedComment = newCommentText.trim();

    setSubmitMessage("");

    if (!trimmedName || !trimmedComment) {
      setSubmitMessage("Please enter your name and question.");
      return;
    }

    if (!courseName) {
      setSubmitMessage("Course information is unavailable.");
      return;
    }

    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "Comments_Vahaly_Astro"), {
        name: trimmedName,
        comment: trimmedComment,
        courseName,
        timestamp: serverTimestamp(),
      });

      setNewCommentName("");
      setNewCommentText("");
      setSubmitMessage("Your question has been submitted successfully.");
    } catch (error) {
      console.error("Error submitting comment:", error);
      setSubmitMessage("Unable to submit your question. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCommentDate = (timestamp) => {
    if (!timestamp?.toDate) return "Just now";

    return timestamp.toDate().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getInitial = (name) => {
    return name?.trim()?.charAt(0)?.toUpperCase() || "U";
  };

  return (
    <div className="space-y-10">
      {/* Q&A video area */}
      <section>
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="h-px w-7 bg-[#aa8435]" />

              <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[#9a772d]">
                Expert Explanations
              </p>
            </div>

            <h3 className="font-serif text-2xl font-semibold text-[#29251f] md:text-3xl">
              Video Answers
            </h3>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#766c5c]">
              Explore detailed answers and guidance related to this course.
            </p>
          </div>

          {videos.length > 1 && (
            <div className="flex items-center gap-2 self-end">
              <button
                ref={previousButtonRef}
                type="button"
                aria-label="Previous answer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffdf8] text-[#66573c] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#27382f] hover:bg-[#27382f] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaChevronLeft className="h-4 w-4" />
              </button>

              <button
                ref={nextButtonRef}
                type="button"
                aria-label="Next answer"
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[#d8c49b] bg-[#fffdf8] text-[#66573c] shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-[#27382f] hover:bg-[#27382f] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <FaChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {videosLoading ? (
          <div className="flex min-h-[300px] items-center justify-center rounded-[24px] border border-[#e5dac4] bg-[#f8f3e9]">
            <div className="text-center">
              <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-[#dbc9a3] border-t-[#96712d]" />

              <p className="mt-4 text-xs font-bold uppercase tracking-[0.2em] text-[#8b7b61]">
                Loading answers
              </p>
            </div>
          </div>
        ) : videos.length > 0 ? (
          <Swiper
            modules={[Navigation, Pagination]}
            slidesPerView={1}
            spaceBetween={22}
            loop={videos.length > 1}
            navigation={{
              prevEl: previousButtonRef.current,
              nextEl: nextButtonRef.current,
            }}
            onBeforeInit={(swiper) => {
              swiper.params.navigation.prevEl = previousButtonRef.current;
              swiper.params.navigation.nextEl = nextButtonRef.current;
            }}
            pagination={{
              clickable: true,
              dynamicBullets: true,
            }}
            className="!pb-12"
          >
            {videos.map((video, index) => (
              <SwiperSlide key={video.id || index}>
                <article className="overflow-hidden rounded-[26px] border border-[#dfd2b9] bg-[#fffdf8] shadow-[0_22px_55px_-35px_rgba(48,38,23,0.55)]">
                  <div className="grid lg:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.7fr)]">
                    {/* Video */}
                    <div className="group relative overflow-hidden bg-[#19251f]">
                      <video
                        src={video.videoUrl}
                        controls
                        controlsList="nodownload"
                        preload="metadata"
                        className="aspect-video h-full max-h-[520px] w-full object-contain"
                      />

                      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-[#17221d]/80 px-3 py-2 text-white backdrop-blur-md">
                        <FaPlay className="h-2.5 w-2.5 text-[#e2c985]" />

                        <span className="text-[9px] font-bold uppercase tracking-[0.18em]">
                          Answer {String(index + 1).padStart(2, "0")}
                        </span>
                      </div>
                    </div>

                    {/* Video information */}
                    <div className="relative flex flex-col justify-center overflow-hidden bg-[#f8f2e7] p-6 md:p-8">
                      <div className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-[#c6a45d]/10 blur-2xl" />

                      <div className="relative">
                        <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.28em] text-[#9a772d]">
                          Course Guidance
                        </p>

                        <h4 className="font-serif text-2xl font-semibold leading-tight text-[#29251f] md:text-3xl">
                          {video.title || `Question and Answer ${index + 1}`}
                        </h4>

                        {video.subTitle && (
                          <p className="mt-4 text-sm leading-7 text-[#746a59]">
                            {video.subTitle}
                          </p>
                        )}

                        <div className="mt-7 flex items-center gap-3 border-t border-[#e3d7bf] pt-5">
                          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#27382f] text-[#e7cf94]">
                            <FaPlay className="ml-0.5 h-3 w-3" />
                          </span>

                          <span className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#665b49]">
                            Watch expert answer
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </SwiperSlide>
            ))}
          </Swiper>
        ) : (
          <div className="rounded-[24px] border border-dashed border-[#d9c7a3] bg-[#f9f5ec] px-6 py-14 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-[#dcc89e] bg-[#fffaf0] text-[#96712d]">
              <FaPlay className="ml-1 h-5 w-5" />
            </div>

            <h4 className="mt-5 font-serif text-xl font-semibold text-[#302b23]">
              Video answers are being prepared
            </h4>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#7b705e]">
              New questions and expert explanations for this course will appear
              here soon.
            </p>
          </div>
        )}
      </section>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-[#e3d7bf]" />
        <span className="h-2 w-2 rotate-45 bg-[#b18a3e]" />
        <div className="h-px flex-1 bg-[#e3d7bf]" />
      </div>

      {/* Questions and comments */}
      <section className="grid gap-7 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        {/* Question form */}
        <div className="rounded-[26px] border border-[#d9c7a3] bg-[#27382f] p-6 text-white shadow-[0_22px_55px_-35px_rgba(26,36,31,0.75)] md:p-8">
          <div className="mb-7 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.07] text-[#e3c982]">
              <FaRegCommentDots className="h-5 w-5" />
            </div>

            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.28em] text-[#dfc57e]">
                Need Guidance?
              </p>

              <h3 className="font-serif text-2xl font-semibold">
                Ask Your Question
              </h3>
            </div>
          </div>

          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="question-name"
                className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/60"
              >
                Your name
              </label>

              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#dec57f]" />

                <input
                  id="question-name"
                  type="text"
                  value={newCommentName}
                  onChange={(event) => setNewCommentName(event.target.value)}
                  placeholder="Enter your name"
                  maxLength={80}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.07] py-3.5 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-[#d8b96f] focus:bg-white/10"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="question-text"
                className="mb-2 block text-[9px] font-bold uppercase tracking-[0.2em] text-white/60"
              >
                Your question
              </label>

              <textarea
                id="question-text"
                value={newCommentText}
                onChange={(event) => setNewCommentText(event.target.value)}
                placeholder="What would you like to understand?"
                rows={5}
                maxLength={1000}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.07] px-4 py-3.5 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-[#d8b96f] focus:bg-white/10"
              />

              <p className="mt-2 text-right text-[10px] text-white/40">
                {newCommentText.length}/1000
              </p>
            </div>

            {submitMessage && (
              <p
                className={`rounded-xl border px-4 py-3 text-xs leading-5 ${
                  submitMessage.includes("successfully")
                    ? "border-[#89a382]/30 bg-[#89a382]/10 text-[#cfe2ca]"
                    : "border-[#e2c985]/20 bg-[#e2c985]/10 text-[#f2dda5]"
                }`}
              >
                {submitMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#d1ad5c] px-6 py-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1d2a24] transition-all duration-300 hover:bg-[#e2c77f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#1d2a24]/30 border-t-[#1d2a24]" />
                  Submitting
                </>
              ) : (
                <>
                  Submit Question
                  <FaPaperPlane className="h-3 w-3" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Community questions */}
        <div className="rounded-[26px] border border-[#dfd2b9] bg-[#fffdf8] p-6 md:p-8">
          <div className="mb-6 flex items-center justify-between gap-4 border-b border-[#e8dfcf] pb-5">
            <div>
              <p className="mb-1 text-[9px] font-bold uppercase tracking-[0.26em] text-[#9a772d]">
                Community
              </p>

              <h3 className="font-serif text-2xl font-semibold text-[#29251f]">
                Student Questions
              </h3>
            </div>

            <span className="rounded-full border border-[#dcc9a3] bg-[#f8f2e7] px-3 py-1.5 text-[10px] font-bold text-[#7b6740]">
              {comments.length}
            </span>
          </div>

          {commentsLoading ? (
            <div className="flex min-h-[260px] items-center justify-center">
              <div className="h-9 w-9 animate-spin rounded-full border-2 border-[#dfd1b5] border-t-[#96712d]" />
            </div>
          ) : sortedComments.length > 0 ? (
            <div className="max-h-[480px] space-y-4 overflow-y-auto pr-1">
              {sortedComments.map((comment) => (
                <article
                  key={comment.id}
                  className="rounded-2xl border border-[#e8deca] bg-[#faf7f0] p-4 transition-colors hover:border-[#d6c096] md:p-5"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#27382f] font-serif font-semibold text-[#e4ca86]">
                      {getInitial(comment.name)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <h4 className="truncate font-semibold text-[#302b23]">
                          {comment.name || "Student"}
                        </h4>

                        <span className="text-[9px] font-bold uppercase tracking-[0.14em] text-[#988b74]">
                          {formatCommentDate(comment.timestamp)}
                        </span>
                      </div>

                      <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-[#716756]">
                        {comment.comment}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[260px] flex-col items-center justify-center rounded-2xl border border-dashed border-[#dcc9a3] bg-[#faf7f0] px-6 text-center">
              <FaRegCommentDots className="h-7 w-7 text-[#a9853d]" />

              <h4 className="mt-4 font-serif text-lg font-semibold text-[#302b23]">
                Begin the conversation
              </h4>

              <p className="mt-2 max-w-sm text-sm leading-6 text-[#7b705e]">
                No questions have been submitted yet. You can be the first
                student to ask.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Classic footer ornament */}
      <div className="flex items-center justify-center pt-2">
        <div className="h-px w-14 bg-[#d2b777]" />
        <FaCheck className="mx-3 h-3 w-3 text-[#9a772d]" />
        <div className="h-px w-14 bg-[#d2b777]" />
      </div>
    </div>
  );
};

export default QandASection;