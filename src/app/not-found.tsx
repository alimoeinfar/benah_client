import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-6xl font-bold text-gray-900">404</h1>
      <p className="mt-4 text-xl text-gray-500">Page not found</p>
      <Link href="/" className="mt-6 text-blue-600 hover:underline">
        Back to home
      </Link>
    </div>
  );
}
