import React, { useState, useRef, useEffect } from "react";
import { Folder, PlayCircle } from "lucide-react";

const data = [
  {
    id: 1,
    type: "folder",
    title: "Breathing Exercise",
    date: "Jun 1, 2023, 12:40 PM",
    items: [
      {
        id: 11,
        type: "video",
        title: "Stress Reliever",
        url: "/videos/stress_reliever.mp4",
        thumbnail: "", // ✅ empty → will auto-generate
        duration: "01:59",
        date: "Jun 1, 2023, 12:40 PM",
      },
      {
        id: 12,
        type: "video",
        title: "Alternate Nostril Breathing",
        url: "/videos/alternate_nostril.mp4",
        thumbnail: "",
        duration: "02:11",
        date: "Jun 1, 2023, 12:40 PM",
      },
      {
        id: 13,
        type: "video",
        title: "Coherent Breathing",
        url: "/videos/coherent_breathing.mp4",
        thumbnail: "",
        duration: "02:05",
        date: "Jun 1, 2023, 12:39 PM",
      },
    ],
  },
  {
    id: 2,
    type: "video",
    title: "Buteyko Breathing",
    url: "/videos/buteyko_breathing.mp4",
    thumbnail: "",
    duration: "02:51",
    date: "Jun 1, 2023",
  },
];

// Component to generate thumbnail if not provided
function VideoThumbnail({ item, onClick }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [thumb, setThumb] = useState(item.thumbnail);

  useEffect(() => {
    if (!thumb && videoRef.current) {
      const video = videoRef.current;
      video.currentTime = 1; // seek to 1 second
      video.onloadeddata = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        setThumb(canvas.toDataURL("image/png")); // save base64 img
      };
    }
  }, [thumb]);

  return (
    <div
      className="aspect-video bg-gray-200 flex items-center justify-center cursor-pointer relative"
      onClick={onClick}
    >
      {item.type === "folder" ? (
        <Folder size={48} className="text-gray-500" />
      ) : thumb ? (
        <img
          src={thumb}
          alt={item.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
      ) : (
        <>
          <video ref={videoRef} src={item.url} className="hidden" />
          <canvas ref={canvasRef} width={320} height={180} className="hidden" />
          <PlayCircle
            size={48}
            className="text-white opacity-90 group-hover:opacity-100 absolute"
          />
        </>
      )}

      {item.duration && (
        <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {item.duration}
        </span>
      )}
    </div>
  );
}

export default function Resource() {
  const [currentFolder, setCurrentFolder] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const itemsToShow = currentFolder ? currentFolder.items : data;

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {selectedVideo
            ? selectedVideo.title
            : currentFolder
            ? currentFolder.title
            : "Library"}
        </h1>

        {(currentFolder || selectedVideo) && (
          <button
            onClick={() =>
              selectedVideo
                ? setSelectedVideo(null)
                : setCurrentFolder(null)
            }
            className="text-blue-600 hover:underline"
          >
            ← Back
          </button>
        )}
      </div>

      {/* Video Player */}
      {selectedVideo ? (
        <div className="w-full flex justify-center bg-black p-4 rounded-xl shadow-lg">
          <video
            src={selectedVideo.url}
            controls
            autoPlay
            className="h-[600px] max-h-[80vh] object-contain rounded-xl"
          />
        </div>
      ) : (
        /* Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {itemsToShow.map((item) => (
            <div
              key={item.id}
              className="group relative border rounded-xl shadow hover:shadow-lg overflow-hidden transition bg-white"
            >
              {/* Thumbnail */}
              <VideoThumbnail
                item={item}
                onClick={() =>
                  item.type === "folder"
                    ? setCurrentFolder(item)
                    : setSelectedVideo(item)
                }
              />

              {/* Details */}
              <div className="p-3">
                <h2 className="text-sm font-semibold truncate">
                  {item.title}
                </h2>
                <p className="text-xs text-gray-500">{item.date}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {item.type === "folder"
                    ? `${item.items.length} items`
                    : "Video"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
