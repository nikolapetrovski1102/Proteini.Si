import { useEffect, useState } from "react";
import { api } from "../../services/api";
import { useLanguage } from "../translation/LanguageContext";
import { BrandLoader } from "../Components/Loaders/BrandLoader";

export default function DynamicContentPage({ pageType }) {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState("");
  const { translate } = useLanguage();

  useEffect(() => {
    if (pageType) {
      fetchSections();
    }
  }, [pageType]);

  const fetchSections = async () => {
    setLoading(true);
    try {
      const data = await api.getDynamicSections(pageType);
      setSections(data);

      // Set page title based on pageType
      if (pageType === "terms-of-service") {
        setPageTitle(translate("termsOfService") || "Terms of Service");
      } else if (pageType === "general-provisions") {
        setPageTitle(translate("generalProvisions") || "General Provisions");
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSectionStyles = (section) => {
    const styles = {};

    if (section.margin_Top) styles.marginTop = `${section.margin_Top}px`;
    if (section.margin_Bottom)
      styles.marginBottom = `${section.margin_Bottom}px`;
    if (section.padding_Top) styles.paddingTop = `${section.padding_Top}px`;
    if (section.padding_Bottom)
      styles.paddingBottom = `${section.padding_Bottom}px`;
    if (section.text_Align) styles.textAlign = section.text_Align;
    if (section.text_Color) styles.color = section.text_Color;
    if (section.font_Size) {
      switch (section.font_Size) {
        case "small":
          styles.fontSize = "12px";
          break;
        case "normal":
          styles.fontSize = "16px";
          break;
        case "large":
          styles.fontSize = "20px";
          break;
        case "xlarge":
          styles.fontSize = "24px";
          break;
        default:
          styles.fontSize = section.font_Size;
      }
    }

    return styles;
  };

  const getTextStyles = (section) => {
    const styles = {};
    if (section.isBold) styles.fontWeight = "bold";
    if (section.isItalic) styles.fontStyle = "italic";
    if (section.isUnderline) styles.textDecoration = "underline";
    return styles;
  };

  const renderSection = (section) => {
    const sectionStyles = getSectionStyles(section);
    const textStyles = getTextStyles(section);
    const className = section.custom_CSS_Class || "";

    switch (section.section_Type) {
      case "title":
        return (
          <h1
            key={section.section_Id}
            className={`text-3xl md:text-4xl font-bold ${className}`}
            style={{ ...sectionStyles, ...textStyles }}
          >
            {section.title_Text}
          </h1>
        );

      case "subtitle":
        return (
          <h2
            key={section.section_Id}
            className={`text-xl md:text-2xl font-semibold ${className}`}
            style={{ ...sectionStyles, ...textStyles }}
          >
            {section.title_Text}
          </h2>
        );

      case "paragraph":
        return (
          <p
            key={section.section_Id}
            className={`leading-relaxed ${className}`}
            style={{ ...sectionStyles, ...textStyles }}
          >
            {section.content_Text}
          </p>
        );

      case "award":
        return (
          <div
            key={section.section_Id}
            className={`border-l-4 border-[#FDC700] pl-4 py-2 ${className}`}
            style={sectionStyles}
          >
            <p className="font-bold" style={textStyles}>
              {section.title_Text} {">>"}
            </p>
            <p className="text-gray-600">{section.content_Text}</p>
          </div>
        );

      case "spacer":
        return (
          <div
            key={section.section_Id}
            style={{ height: `${section.margin_Top || 20}px` }}
          />
        );

      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[400px]">
        <BrandLoader variant="shaker" size={120} />
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-gray-50 min-h-screen py-12">
      <div className="w-full max-w-[1240px] px-4">
        {/* Page Header */}
        <div className="mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-[20px] font-bold text-gray-800">{pageTitle}</h1>
        </div>

        {/* Dynamic Content Sections */}
        <div className="space-y-6">
          {sections.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              No content available. Please check back later.
            </div>
          ) : (
            sections.map((section) => renderSection(section))
          )}
        </div>
      </div>
    </div>
  );
}
