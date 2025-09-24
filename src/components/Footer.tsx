export default function Footer() {
  return (
    <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-10 text-sm text-gray-500">
      <div className="flex items-center justify-between">
        <p>© {new Date().getFullYear()} Metasebiya Mulugeta</p>
        <a href="mailto:metasebiya42@gmail.com" className="hover:underline">metasebiya42@gmail.com</a>
      </div>
    </footer>
  );
}
