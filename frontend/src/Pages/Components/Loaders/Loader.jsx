// src/Pages/Components/Loader.jsx
export default function Loader() {
  return (
    <div className="flex justify-center items-center">
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-4 border-t-[#FDC700] border-r-[#FDC700] border-b-transparent border-l-transparent animate-spin"></div>
      </div>
    </div>
  );
}
