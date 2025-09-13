// client/src/pages/BookDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Send, Clock, MessageCircle } from "lucide-react";
import { api } from "../lib/api";

const BookDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null);
  const [requestSent, setRequestSent] = useState(false);

  useEffect(() => {
    let mounted = true;

    const fetchBookDetails = async () => {
      try {
        setLoading(true);
        const [bookRes, meRes] = await Promise.all([
          api.get(`/books/${id}`),
          api.get(`/auth/me`),
        ]);
        if (!mounted) return;

        const b = bookRes?.book || bookRes;
        const me = meRes?.user || meRes;

        setBook(b || null);
        setLoggedInUserId(me?._id || me?.id || null);

        try {
          const txRes = await api.get(`/transactions?book_id=${id}`);
          const txs = txRes?.transactions || txRes || [];
          const myId = me?._id || me?.id;
          const hasPending = Array.isArray(txs)
            ? txs.some(
                (t) =>
                  String(t?.sender_id || t?.sender?._id) === String(myId) &&
                  (t?.status || "").toLowerCase() === "pending"
              )
            : false;
          setRequestSent(hasPending);
        } catch {}
        setError(null);
      } catch (e) {
        setError(e?.message || "Failed to fetch data");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBookDetails();
    return () => {
      mounted = false;
    };
  }, [id]);

  const handleSendRequest = async () => {
    try {
      await api.post(`/transactions`, { book_id: id });
      setRequestSent(true);
      alert("Exchange request sent successfully!");
    } catch (e) {
      alert(e?.message || "Failed to send request");
    }
  };

  const handleBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  };

  const handleOpenChat = (owner) => {
    navigate(`/chat?to=${owner}`);
  };

  if (loading) return <p className="p-6">Loading book details...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!book) return <p className="p-6 text-red-500">Book not found.</p>;

  const cover =
    book.cover_image
      ? `${import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "")}/storage/${book.cover_image}`
      : book.coverUrl || "https://via.placeholder.com/150";

  const ownerId = book.user_id || book.owner?._id || book.ownerId;
  const status = (book.status || "available").toLowerCase();
  const title = book.title || "Untitled";
  const author = book.author || "Unknown";
  const genre =
    typeof book.genre === "string"
      ? book.genre
      : Array.isArray(book.genre)
      ? book.genre.join(", ")
      : "—";
  const description = book.description || "No description provided.";

  const isViewerOwner =
    loggedInUserId && ownerId && String(loggedInUserId) === String(ownerId);

  return (
    <div className="min-h-screen mt-8 relative">
      <div className="max-w-[1050px] mx-auto w-full px-4 mb-4">
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition"
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </button>
      </div>

      <div className="flex flex-row">
        <div className="w-72 h-auto bg-[#f0eee2] rounded-xl flex items-center justify-center shadow-sm relative mx-32 ">
          <img src={cover} alt={title} className="object-cover rounded-lg w-full h-full" />
        </div>

        <div className="flex justify-between w-full">
          <div className="w-1/2">
            <h3 className="font-bold text-gray-900 text-4xl p-3 -mx-24">{title}</h3>
            <p className="w-full text-2xl text-gray-500 px-4 -mx-24">By {author}</p>
            <p className="w-fit text-lg font-semibold rounded-full text-gray-700 border border-black -mx-20 px-4 py-2 my-4 capitalize">
              {status}
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-12">
        <div className="max-w-[1050px] w-full h-auto mx-auto bg-[#f8f9fa] border border-gray-200 rounded-xl px-16 py-24 shadow-lg -my-18">
          <h2 className="text-xl font-bold mb-4">Genre</h2>
          <p className="w-fit text-lg font-semibold rounded-2xl text-black border border-black px-4 py-2 my-4">
            {genre}
          </p>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-4">Description</h2>
            <p className="text-gray-700">{description}</p>
          </div>

          {loggedInUserId && ownerId && String(loggedInUserId) !== String(ownerId) && (
            <div className="mt-8 flex flex-col gap-4 w-1/3">
              {status === "available" && !requestSent && (
                <button
                  onClick={handleSendRequest}
                  className="inline-flex items-center justify-center px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors"
                >
                  <span>Send Exchange Request</span>
                  <Send className="ml-2" size={20} />
                </button>
              )}

              {requestSent && (
                <button
                  disabled
                  className="inline-flex items-center justify-center px-6 py-3 bg-gray-400 text-white font-semibold rounded-lg cursor-not-allowed"
                >
                  <span>Request Pending</span>
                  <Clock className="ml-2" size={20} />
                </button>
              )}
            </div>
          )}

          {!loggedInUserId && (
            <div className="mt-8">
              <button
                onClick={() => navigate(`/login?redirect=/books/${id}`)}
                className="inline-flex items-center justify-center px-6 py-3 bg-gray-900 text-white font-semibold rounded-lg hover:bg-sky-500 transition-colors"
              >
                <span>Login to exchange</span>
                <ArrowRight className="ml-2" size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      {loggedInUserId && ownerId && !isViewerOwner && (
        <button
          onClick={() => handleOpenChat(ownerId)}
          className="fixed bottom-6 right-6 p-4 rounded-full shadow-lg bg-gray-900 text-white hover:bg-sky-500 transition group"
          aria-label="Chat with owner"
          title="Open chat with the owner"
        >
          <MessageCircle size={24} />
          <span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 bg-gray-900 text-white text-xs px-2 py-1 rounded">
            Chat with owner
          </span>
        </button>
      )}
    </div>
  );
};

export default BookDetails;
