'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  const handleNewChat = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/sessions', { 
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({ title: 'New Chat' }) 
      });
      const data = await res.json();
      if (data.id) {
        router.push(`/chat/${data.id}`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAF9F6] text-[#2C1A12] font-sans selection:bg-[#C84B31] selection:text-[#FAF9F6] overflow-x-hidden w-full">
      
      {/* Hero Section */}
      <section className="min-h-[100svh] w-full flex flex-col items-start justify-center relative px-6 md:px-16 lg:px-32 border-b-[12px] border-b-[#C84B31] border-double">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col items-start max-w-6xl w-full mx-auto"
        >
          <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="inline-block px-4 py-1.5 bg-[#2C1A12] text-[#FAF9F6] text-xs font-bold tracking-[0.2em] uppercase">
              Legal Assistant
            </span>
            <div className="flex gap-4 items-center">
              <span className="text-[#C84B31] text-xl font-serif font-bold">சட்டம்</span>
              <span className="w-1.5 h-1.5 bg-[#E19B2D] rounded-none rotate-45" />
              <span className="text-[#C84B31] text-xl font-serif font-bold">न्याय</span>
              <span className="w-1.5 h-1.5 bg-[#E19B2D] rounded-none rotate-45" />
              <span className="text-[#C84B31] text-xl font-serif font-bold">న్యాయం</span>
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter leading-[1.02] mb-8 text-[#2C1A12]"
          >
            Clarity in Law. <br />
            <span className="text-[#C84B31]">Grounded in Truth.</span>
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl lg:text-3xl text-[#5C4A42] max-w-3xl mb-14 leading-snug font-medium"
          >
            Understand the complexities of the Indian Penal Code in your native language, without the jargon.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-8 w-full sm:w-auto">
            <button 
              onClick={handleNewChat}
              className="bg-[#E19B2D] text-[#2C1A12] px-10 py-5 text-lg font-bold uppercase tracking-wider hover:bg-[#c28424] transition-transform duration-100 w-full sm:w-auto text-center border-2 border-[#2C1A12] shadow-[6px_6px_0px_0px_#2C1A12] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_#2C1A12]"
            >
              Start Consultation
            </button>
            <div className="flex flex-col justify-center text-sm text-[#5C4A42]">
              <span className="font-bold uppercase tracking-widest text-[#2C1A12] mb-0.5">Secure & Private</span>
              <span>100% Local Processing</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator styled like a hanging thread */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-0 left-6 md:left-16 lg:left-32 flex flex-col items-center gap-4 text-[#C84B31] uppercase tracking-widest text-xs font-bold"
        >
          <span style={{ writingMode: 'vertical-rl' }} className="mb-2">Scroll</span>
          <div className="w-[2px] h-16 bg-[#C84B31]" />
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-32 px-6 md:px-16 lg:px-32 bg-[#FAF9F6] w-full border-b-[12px] border-b-[#E19B2D] border-double">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto w-full"
        >
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
            <div className="flex-1 relative">
              {/* Typographic structural art */}
              <span className="text-[12rem] md:text-[16rem] leading-none absolute -top-20 -left-12 text-[#C84B31] opacity-5 font-serif select-none pointer-events-none">
                भारत
              </span>
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#2C1A12] mb-6 leading-[1.05] relative z-10">
                Built for the <br/><span className="text-[#C84B31]">Indian Context.</span>
              </h2>
              <p className="text-xl md:text-2xl text-[#5C4A42] max-w-xl leading-relaxed font-medium relative z-10">
                LegalEase bridges the gap between complex constitutional language and everyday understanding, deeply rooted in local nuances.
              </p>
            </div>
            
            <div className="flex-1 flex flex-col gap-16 w-full mt-10 lg:mt-0">
              {/* Feature 1 */}
              <div className="relative pl-12 border-l-4 border-[#2C1A12]">
                <span className="absolute -left-16 top-2 text-4xl font-bold text-[#E19B2D] rotate-[-90deg] origin-top-right uppercase tracking-widest font-serif opacity-80">
                  ०१
                </span>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-3xl font-bold text-[#2C1A12] tracking-tight">11+ Regional Languages</h3>
                  <span className="px-2 py-0.5 bg-[#C84B31] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest">மொழி</span>
                </div>
                <p className="text-[#5C4A42] leading-relaxed text-xl">
                  Speak naturally. Whether it's Tamil, Hindi, Malayalam, or Marathi, our engine translates complex IPC sections into clear, native explanations.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="relative pl-12 border-l-4 border-[#2C1A12]">
                <span className="absolute -left-16 top-2 text-4xl font-bold text-[#C84B31] rotate-[-90deg] origin-top-right uppercase tracking-widest font-serif opacity-80">
                  ०२
                </span>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-3xl font-bold text-[#2C1A12] tracking-tight">Jargon-Free Clarity</h3>
                  <span className="px-2 py-0.5 bg-[#E19B2D] text-[#2C1A12] text-xs font-bold uppercase tracking-widest">स्पष्टता</span>
                </div>
                <p className="text-[#5C4A42] leading-relaxed text-xl">
                  We strip away the convoluted Latin terms and archaic colonial phrasing, presenting you with the raw truth of the law and real-world examples.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="relative pl-12 border-l-4 border-[#2C1A12]">
                <span className="absolute -left-16 top-2 text-4xl font-bold text-[#2C1A12] rotate-[-90deg] origin-top-right uppercase tracking-widest font-serif opacity-80">
                  ०३
                </span>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-3xl font-bold text-[#2C1A12] tracking-tight">Total Privacy</h3>
                  <span className="px-2 py-0.5 bg-[#2C1A12] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest">ரகசியம்</span>
                </div>
                <p className="text-[#5C4A42] leading-relaxed text-xl">
                  Legal matters are deeply personal. Everything processes 100% locally on your machine. No cloud, no logs, no compromise.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA / Footer */}
      <section className="py-48 px-6 md:px-16 lg:px-32 bg-[#2C1A12] text-[#FAF9F6] w-full flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Typographic Indian Motto Watermark */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center opacity-[0.05] pointer-events-none select-none w-full">
          <span className="text-[12vw] md:text-[10vw] font-serif font-bold leading-[0.9] whitespace-nowrap text-[#E19B2D]">
            सत्यमेव जयते
          </span>
          <span className="text-[10vw] md:text-[8vw] font-serif font-bold leading-[0.9] whitespace-nowrap text-[#C84B31]">
            வாய்மையே வெல்லும்
          </span>
        </div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center flex flex-col items-center relative z-10 w-full"
        >
          {/* Temple-architecture inspired separator */}
          <div className="flex items-center gap-6 mb-16">
            <div className="w-16 h-1.5 bg-[#E19B2D]" />
            <div className="w-4 h-4 bg-[#C84B31] rotate-45" />
            <div className="w-16 h-1.5 bg-[#E19B2D]" />
          </div>

          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-14 text-[#FAF9F6]">
            Know Your Rights.
          </h2>
          <button 
            onClick={handleNewChat}
            className="bg-[#C84B31] text-[#FAF9F6] px-12 py-6 text-xl md:text-2xl font-bold uppercase tracking-widest hover:bg-[#A63A23] transition-transform duration-100 border-4 border-[#C84B31] shadow-[8px_8px_0px_0px_#E19B2D] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_#E19B2D]"
          >
            Ask LegalEase
          </button>
        </motion.div>
      </section>

    </div>
  );
}
