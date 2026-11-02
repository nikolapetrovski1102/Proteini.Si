export function LargeLoader() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#FDC700] border-r-[#FDC700] border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    </div>
  );
}
