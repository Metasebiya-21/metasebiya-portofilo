import Header from "@/components/Header";
import Footer from "@/components/Footer";
export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mt-8">
        <h1 className="text-3xl font-bold mb-4">Contact</h1>
        <p className="text-gray-600 dark:text-gray-300">
          Email me at <a className="underline" href="mailto:metasebiya42@gmail.com">metasebiya42@gmail.com</a> or connect on{" "}
          <a className="underline" href="https://www.linkedin.com/in/metasebiya21" target="_blank" rel="noreferrer">LinkedIn</a>.
        </p>
      </main>
      <Footer />
    </>
  );
}
