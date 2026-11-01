import { useState, useEffect } from "react";
import { api } from "../../../../services/api";

export default function AboutTheCompanyProteiniSi() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const data = await api.getAboutCompanySections();
      setSections(data);
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/")) {
      return `https://proteini.mk${imagePath}`;
    }
    return imagePath;
  };

  const renderSection = (section) => {
    switch (section.sectionType) {
      case "video":
        return (
          <div key={section.id} className="mb-8">
            <div className="relative pb-[56.25%] h-0">
              <iframe
                className="absolute top-0 left-0 w-full h-full"
                src={
                  section.videoUrl ||
                  "https://www.youtube.com/embed/beU6PhV2fqA"
                }
                title={section.title || "YouTube video player"}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            {section.title && (
              <p className="mt-4 text-center text-gray-600">{section.title}</p>
            )}
          </div>
        );

      case "title":
        return (
          <p key={section.id} className="mt-16 mb-4 font-bold text-xl">
            {section.title}
          </p>
        );

      case "subtitle":
        return (
          <p key={section.id} className="my-8 font-bold text-lg">
            {section.title}
          </p>
        );

      case "paragraph":
        return (
          <p key={section.id} className="mb-4 leading-relaxed">
            {section.content}
          </p>
        );

      case "award":
        return (
          <div key={section.id}>
            <p className="font-bold mt-4">
              {section.title} {">>"}
            </p>
            <p className="mb-4">{section.content}</p>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center items-center py-12">
      <div className="w-full max-w-[1240px] px-4">
        {sections.length === 0 ? (
          <div className="text-center text-gray-500">
            No content available. Please check back later.
          </div>
        ) : (
          sections.map((section) => renderSection(section))
        )}
      </div>
    </div>
  );
}
