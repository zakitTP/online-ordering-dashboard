export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700">
          Page Not Found
        </h2>
        <p className="text-gray-500 mt-2">
          Sorry, the page you are looking for does not exist.
        </p>
      </div>
    </div>
  );
}
