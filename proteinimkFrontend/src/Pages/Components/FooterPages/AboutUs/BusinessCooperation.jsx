import { useEffect, useState } from "react";
import { api } from "../../../../services/api";
import { useLanguage } from "../../../translation/LanguageContext";

export default function BusinessCooperation() {
  const { translate } = useLanguage();
  const [section, setSection] = useState(null);

  useEffect(() => {
    let isMounted = true;

    api.getAboutCompanySections().then((sections) => {
      if (!isMounted) return;

      const businessSection = sections.find(
        (item) => item.sectionType === "business-cooperation",
      );

      if (businessSection) {
        setSection(businessSection);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const title = section?.title || translate("businessCooperationTitle");
  const imageSrc =
    section?.videoThumbnailPath || "/img/poslovne-priloznosti.jpg";
  const paragraphs = section?.content
    ? section.content.split(/\n{2,}/).filter(Boolean)
    : [
        translate("businessCooperationDesc1"),
        translate("businessCooperationDesc2"),
      ];

  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full max-w-[1240px]">
        <p className="mb-4 font-bold">{title}</p>
        <img
          src={imageSrc}
          alt={translate("businessCooperationImageAlt")}
        />
        {paragraphs.map((paragraph, index) => (
          <p key={paragraph} className={index === 0 ? "mt-12 mb-4" : "mb-4"}>
            {paragraph}
          </p>
        ))}
        <p>
          {translate("businessCooperationContact")}{" "}
          <a
            href="mailto:makedonija@proteini.si"
            className="font-bold underline"
          >
            makedonija@proteini.si
          </a>
        </p>
      </div>
    </div>
  );
}
