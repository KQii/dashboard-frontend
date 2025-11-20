export default function Footer() {
  return (
    <footer className="w-full border-t bg-slate-200">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} Your Company. All rights reserved.
        </p>

        <div className="flex gap-4 text-sm text-gray-600">
          <a href="/privacy" className="hover:text-gray-900 transition">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:text-gray-900 transition">
            Terms of Service
          </a>
          <a href="/contact" className="hover:text-gray-900 transition">
            Contact
          </a>
        </div>
      </div>
    </footer>
  );
}
