import MathContent from './MathContent'
import type { TopicVideo } from '@/lib/theory-videos'

interface Props {
  video: TopicVideo
}

export default function TheoryVideo({ video }: Props) {
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    video.searchQuery
  )}`

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <h2 className="text-lg font-bold text-gray-800 mb-4">🎬 Video hướng dẫn lý thuyết</h2>

      {video.videoId ? (
        <div className="aspect-video w-full rounded-xl overflow-hidden border border-gray-200 mb-4">
          <iframe
            className="w-full h-full"
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : (
        <a
          href={youtubeSearchUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 aspect-video w-full rounded-xl border-2 border-dashed border-indigo-200 bg-indigo-50 mb-4 hover:bg-indigo-100 transition-colors"
        >
          <span className="text-indigo-600 font-semibold text-sm">
            ▶ Tìm video hướng dẫn &quot;{video.title}&quot; trên YouTube
          </span>
        </a>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="text-sm font-semibold text-gray-700">{video.title}</div>
        {video.channel && (
          <span className="text-xs text-gray-400">Nguồn: {video.channel}</span>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
        <div className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
          Trọng tâm cần nắm khi xem video
        </div>
        <ul className="space-y-2">
          {video.keyPoints.map((point, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-amber-400 mt-0.5 flex-shrink-0">•</span>
              <span className="text-sm text-gray-700 leading-relaxed">
                <MathContent text={point} />
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
