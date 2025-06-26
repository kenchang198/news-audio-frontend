import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">ページが見つかりません</h2>
        <p className="text-gray-600 mb-4">お探しのページは存在しないか、移動した可能性があります。</p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 inline-block"
        >
          ホームに戻る
        </Link>
      </div>
    </div>
  );
}