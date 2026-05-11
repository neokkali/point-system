const Footer = () => {
  {
    /* الفوتر الجديد */
  }
  return (
    <footer className="w-full bg-white dark:bg-black/40 backdrop-blur-md border-t border-gray-200 dark:border-white/10 py-4 px-6 lg:px-10 sm:mt-10">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        {/* اليمين: تدرج أزرق فخم */}
        <div className="text-right">
          <span className="text-transparent bg-clip-text bg-gradient-to-br from-blue-400 via-indigo-500 to-purple-600 font-bold text-xl tracking-wide">
            شات فله الخليج
          </span>
        </div>

        {/* المنتصف: التاريخ */}
        <div className="text-gray-500 dark:text-gray-400 text-sm font-medium md:border-x border-gray-200 dark:border-white/5 px-8">
          {new Date().getFullYear()} © جميع الحقوق محفوظة
        </div>

        {/* اليسار: اسمك */}
        <div className="flex flex-col items-center md:items-end">
          <p className="text-gray-400 dark:text-gray-500 text-[10px] uppercase tracking-tighter mb-0">
            Developed By
          </p>
          <span className="text-gray-900 flex justify-center dark:text-white font-black tracking-widest uppercase text-sm">
            Mn
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
