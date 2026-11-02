import { useState, useEffect } from "react";
import { useLanguage } from "./translation/LanguageContext";
import { api } from "../services/api";

export default function Partners() {
  const { translate } = useLanguage();
  const [partners, setPartners] = useState([]);
  const [awards, setAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPartnersAndAwards();
  }, []);

  const fetchPartnersAndAwards = async () => {
    try {
      const data = await api.getPartners();
      // Separate partners and awards
      const partnersList = data.filter(
        (item) => item.type === "partner" && item.isActive,
      );
      const awardsList = data.filter(
        (item) => item.type === "award" && item.isActive,
      );
      setPartners(partnersList);
      setAwards(awardsList);
    } catch (error) {
      console.error("Error fetching partners:", error);
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

  if (loading) {
    return (
      <div className="w-full flex justify-center bg-[#E5E5E5] pt-[36px] pb-[60px]">
        <div className="w-full max-w-[1240px] flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-[#E5E5E5] pt-[36px] pb-[60px]">
      <div className="w-full max-w-[1240px] flex max-sm:flex-col max-sm:gap-12 justify-center">
        {/* Partners Section */}
        <div className="pl-[15px] pr-[40px] max-sm:px-[15px] flex flex-col items-center max-sm:items-start flex-1">
          <span className="text-[24px] font-bold mb-[40px] max-sm:mb-[20px] max-sm:text-[20px]">
            {translate("partners")}
          </span>
          <div className="flex overflow-x-auto gap-[24px] pb-4">
            {partners.length === 0 ? (
              <p className="text-gray-500 text-sm">No partners available</p>
            ) : (
              partners.map((partner) => (
                <a
                  key={partner.id}
                  href={partner.url || "#"}
                  target={partner.url ? "_blank" : "_self"}
                  rel={partner.url ? "noopener noreferrer" : ""}
                  className="flex-shrink-0 hover:opacity-80 transition-opacity"
                >
                  <img
                    src={getImageUrl(partner.imagePath)}
                    alt={partner.name}
                    width={90}
                    height={90}
                    className="w-[90px] h-[90px] object-contain"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                      e.target.onerror = null;
                    }}
                  />
                </a>
              ))
            )}
          </div>
        </div>

        {/* Awards Section */}
        <div className="pl-[40px] pr-[15px] max-sm:px-[12px] flex flex-col items-center max-sm:items-start flex-1">
          <span className="text-[24px] font-bold mb-[40px] max-sm:mb-[20px] max-sm:text-[20px]">
            {translate("awardsAndCertificates")}
          </span>
          <div className="flex overflow-x-auto gap-[24px] pb-4">
            {awards.length === 0 ? (
              <p className="text-gray-500 text-sm">No awards available</p>
            ) : (
              awards.map((award) => (
                <div key={award.id} className="flex-shrink-0">
                  <img
                    src={getImageUrl(award.imagePath)}
                    alt={award.name}
                    width={90}
                    height={90}
                    className="w-[90px] h-[90px] object-contain"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='90' height='90' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Crect x='2' y='2' width='20' height='20' rx='2.18'%3E%3C/rect%3E%3Cpath d='M7 2v20M17 2v20M2 12h20M2 7h5M2 17h5M17 17h5M17 7h5'%3E%3C/path%3E%3C/svg%3E";
                      e.target.onerror = null;
                    }}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
