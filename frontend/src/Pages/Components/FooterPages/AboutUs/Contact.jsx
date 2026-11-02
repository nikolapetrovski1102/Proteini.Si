import { useLanguage } from "../../../translation/LanguageContext";

export default function Contact() {
  const { translate } = useLanguage();
  return (
    <div className="w-full flex justify-center items-center">
      <div className="w-full max-w-[1240px]">
        <p className="font-bold mb-4">{translate("contactAssistance")}</p>
        <p>
          <strong>{translate("phoneLabel")}:</strong> +389 71 399 036
        </p>
        <p className="mb-8 font-bold">
          <span>{translate("emailLabel")}:</span>{" "}
          <a href="mailto:makedonija@proteini.si" className="cursor-pointer">
            makedonija@proteini.si
          </a>
        </p>
        <p className="mt-4 font-bold mb-4">{translate("workingHours")}</p>
        <p>{translate("workingHoursWeekdays")}</p>
        <p>{translate("workingHoursWeekend")}</p>
      </div>
    </div>
  );
}
