'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  const handleNewChat = () => {
    router.push('/chat');
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
      <section className="shrink-0 min-h-[100svh] w-full flex flex-col items-start justify-center relative px-6 md:px-16 lg:px-32 border-b-[12px] border-b-[#C84B31] border-double overflow-hidden">
        
        {/* Background Animated Watermark */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.03, scale: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
          className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none select-none z-0"
        >
          <h1 className="text-[30vw] font-bold tracking-tighter leading-none text-[#2C1A12] whitespace-nowrap">
            URIM
          </h1>
        </motion.div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="flex flex-col items-start max-w-6xl w-full mx-auto relative z-10"
        >
          <motion.div variants={itemVariants} className="mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <span className="inline-block px-4 py-1.5 bg-[#2C1A12] text-[#FAF9F6] text-xs font-bold tracking-[0.2em] uppercase shadow-[4px_4px_0px_0px_#E19B2D]">
              Introducing URIM-AI
            </span>
            <div className="flex gap-4 items-center">
              <span className="text-[#C84B31] text-xl font-serif font-bold">சட்டம்</span>
              <motion.span 
                animate={{ rotate: 360 }} 
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 bg-[#E19B2D] rounded-none" 
              />
              <span className="text-[#C84B31] text-xl font-serif font-bold">न्याय</span>
              <motion.span 
                animate={{ rotate: -360 }} 
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                className="w-2 h-2 bg-[#E19B2D] rounded-none" 
              />
              <span className="text-[#C84B31] text-xl font-serif font-bold">న్యాయం</span>
            </div>
          </motion.div>

          <motion.h1 
            variants={itemVariants}
            className="text-6xl md:text-8xl lg:text-[7.5rem] font-bold tracking-tighter leading-[1.02] mb-8 text-[#2C1A12]"
          >
            Meet <span className="text-[#C84B31]">MEI.</span> <br />
            Your Legal Mind.
          </motion.h1>

          <motion.p 
            variants={itemVariants}
            className="text-xl md:text-2xl lg:text-3xl text-[#5C4A42] max-w-3xl mb-14 leading-snug font-medium"
          >
            Powered by URIM-AI. Understand the complexities of the Indian Penal Code in your native language, without the jargon.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center gap-8 w-full sm:w-auto">
            <button 
              onClick={handleNewChat}
              className="bg-[#E19B2D] text-[#2C1A12] px-10 py-5 text-lg font-bold uppercase tracking-wider hover:bg-[#c28424] transition-transform duration-100 w-full sm:w-auto text-center border-4 border-[#2C1A12] shadow-[8px_8px_0px_0px_#2C1A12] active:translate-y-1 active:translate-x-1 active:shadow-[0px_0px_0px_0px_#2C1A12]"
            >
              Consult MEI
            </button>
            <div className="flex flex-col justify-center text-sm text-[#5C4A42]">
              <span className="font-bold uppercase tracking-widest text-[#2C1A12] mb-0.5">Secure & Private</span>
              <span>100% Local Processing</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll Indicator styled like a hanging thread */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 1, repeat: Infinity, repeatType: "reverse" }}
          className="absolute bottom-0 left-6 md:left-16 lg:left-32 flex flex-col items-center gap-4 text-[#C84B31] uppercase tracking-widest text-xs font-bold z-10"
        >
          <span style={{ writingMode: 'vertical-rl' }} className="mb-2">Scroll</span>
          <div className="w-[3px] h-16 bg-[#C84B31]" />
        </motion.div>
      </section>

      {/* Features Section */}
      {/* Features Section */}
      <section className="shrink-0 py-32 px-6 md:px-16 lg:px-32 bg-[#FAF9F6] w-full border-b-[12px] border-b-[#E19B2D] border-double relative">
        
        {/* Floating Tamil Watermarks */}
        <motion.div 
          animate={{ y: [0, -30, 0], opacity: [0.03, 0.05, 0.03] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 right-10 text-[10rem] font-serif text-[#C84B31] pointer-events-none select-none z-0"
        >
          அறம்
        </motion.div>
        
        <motion.div 
          animate={{ y: [0, 40, 0], opacity: [0.02, 0.04, 0.02] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-20 left-10 text-[8rem] font-serif text-[#2C1A12] pointer-events-none select-none z-0"
        >
          நீதி
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true, margin: "-100px" }}
          className="max-w-7xl mx-auto w-full relative z-10"
        >
          <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-24">
            <div className="flex-1 relative">
              <h2 className="text-5xl md:text-7xl font-bold tracking-tighter text-[#2C1A12] mb-6 leading-[1.05] relative z-10">
                Built for the <br/><span className="text-[#C84B31]">Indian Context.</span>
              </h2>
              <p className="text-xl md:text-2xl text-[#5C4A42] max-w-xl leading-relaxed font-medium relative z-10">
                URIM-AI bridges the gap between complex constitutional language and everyday understanding, deeply rooted in local nuances.
              </p>
            </div>
            
            <div className="flex-1 flex flex-col gap-16 w-full mt-10 lg:mt-0">
              {/* Feature 1 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="relative pl-12 border-l-4 border-[#2C1A12] hover:border-[#C84B31] transition-colors"
              >
                <span className="absolute -left-14 top-1 text-5xl font-bold text-[#E19B2D] rotate-[-90deg] origin-top-right uppercase tracking-widest font-serif opacity-90">
                  ௧
                </span>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-3xl font-bold text-[#2C1A12] tracking-tight">11+ Regional Languages</h3>
                  <span className="px-2 py-0.5 bg-[#C84B31] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest">மொழி</span>
                </div>
                <p className="text-[#5C4A42] leading-relaxed text-xl">
                  Speak naturally. Whether it's Tamil, Hindi, Malayalam, or Marathi, our engine translates complex IPC sections into clear, native explanations.
                </p>
              </motion.div>

              {/* Feature 2 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="relative pl-12 border-l-4 border-[#2C1A12] hover:border-[#E19B2D] transition-colors"
              >
                <span className="absolute -left-14 top-1 text-5xl font-bold text-[#C84B31] rotate-[-90deg] origin-top-right uppercase tracking-widest font-serif opacity-90">
                  ௨
                </span>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-3xl font-bold text-[#2C1A12] tracking-tight">Jargon-Free Clarity</h3>
                  <span className="px-2 py-0.5 bg-[#E19B2D] text-[#2C1A12] text-xs font-bold uppercase tracking-widest">தெளிவு</span>
                </div>
                <p className="text-[#5C4A42] leading-relaxed text-xl">
                  We strip away the convoluted Latin terms and archaic colonial phrasing, presenting you with the raw truth of the law and real-world examples.
                </p>
              </motion.div>

              {/* Feature 3 */}
              <motion.div 
                initial={{ opacity: 0, x: 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
                className="relative pl-12 border-l-4 border-[#2C1A12] hover:border-[#2C1A12] transition-colors"
              >
                <span className="absolute -left-14 top-1 text-5xl font-bold text-[#2C1A12] rotate-[-90deg] origin-top-right uppercase tracking-widest font-serif opacity-90">
                  ௩
                </span>
                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <h3 className="text-3xl font-bold text-[#2C1A12] tracking-tight">Total Privacy</h3>
                  <span className="px-2 py-0.5 bg-[#2C1A12] text-[#FAF9F6] text-xs font-bold uppercase tracking-widest">ரகசியம்</span>
                </div>
                <p className="text-[#5C4A42] leading-relaxed text-xl">
                  Legal matters are deeply personal. Everything processes 100% locally on your machine. No cloud, no logs, no compromise.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Bottom CTA / Footer */}
      {/* Bottom CTA / Footer */}
      <section className="shrink-0 py-48 px-6 md:px-16 lg:px-32 bg-[#2C1A12] text-[#FAF9F6] w-full flex flex-col items-center justify-center relative overflow-hidden">
        
        {/* Typographic Indian Motto Watermark */}
        <motion.div 
          animate={{ scale: [1, 1.05, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center pointer-events-none select-none w-full"
        >
          <span className="text-[12vw] md:text-[10vw] font-serif font-bold leading-[0.9] whitespace-nowrap text-[#E19B2D]">
            सत्यमेव जयते
          </span>
          <span className="text-[10vw] md:text-[8vw] font-serif font-bold leading-[0.9] whitespace-nowrap text-[#C84B31]">
            வாய்மையே வெல்லும்
          </span>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: true }}
          className="max-w-5xl mx-auto text-center flex flex-col items-center relative z-10 w-full"
        >
          {/* Temple-architecture inspired separator */}
          <div className="flex items-center gap-6 mb-16">
            <motion.div 
              animate={{ width: ["4rem", "6rem", "4rem"] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 bg-[#E19B2D]" 
            />
            <motion.div 
              animate={{ rotate: 360 }} 
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="w-4 h-4 bg-[#C84B31]" 
            />
            <motion.div 
              animate={{ width: ["4rem", "6rem", "4rem"] }} 
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="h-1.5 bg-[#E19B2D]" 
            />
          </div>

          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-14 text-[#FAF9F6]">
            Know Your Rights.
          </h2>
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleNewChat}
            className="bg-[#C84B31] text-[#FAF9F6] px-12 py-6 text-xl md:text-2xl font-bold uppercase tracking-widest transition-colors duration-100 border-4 border-[#C84B31] shadow-[8px_8px_0px_0px_#E19B2D]"
          >
            Ask URIM-AI
          </motion.button>
        </motion.div>
      </section>
    </div>
  );
}
