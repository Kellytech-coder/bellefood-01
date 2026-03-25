// components/layout/Footer.tsx

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-6">
      <div className="max-w-7xl mx-auto text-center text-gray-400">
        © {new Date().getFullYear()} Your Brand. All rights reserved.
      </div>
    </footer>
  );
}