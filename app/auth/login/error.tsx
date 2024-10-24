'use client';

export default function LoginError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-red-600">Đã có lỗi xảy ra</h2>
        <p className="mt-2 text-gray-600">{error.message}</p>
        <button onClick={reset} className="mt-4 btn btn-primary">
          Thử lại
        </button>
      </div>
    </div>
  );
}
