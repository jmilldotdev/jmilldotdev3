import Header from "@/components/Header";
import Main from "@/components/Main";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      id="app"
      className="grid grid-cols-[1fr_300px] grid-rows-[60px_1fr_60px] h-screen p-2.5 gap-2.5"
    >
      <Header />
      <Main />
      <Sidebar />
      <Footer />
    </div>
  );
}
