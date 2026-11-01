import { useLanguage } from "./translation/LanguageContext";

export default function NeedHelp() {
  const { translate } = useLanguage();
  return (
    <div className="w-full flex justify-center pt-[31px] pb-[51px] min-h-[223px] border-t border-[#E5E5E5]">
      <div className="w-full max-w-[1240px] flex flex-col items-center">
        <div className="mx-auto max-w-[300px] mb-[27px] text-center">
          <span className="text-[21px] max-md:text-[16px] leading-[26px] font-bold mb-[5px]">
            {translate("needHelp")}
          </span>
          <p className="text-[14px] max-md:text-[12px] leading-[17px] max-w-[280px] text-center">
            {translate("weAreAvailableForYou")}
          </p>
        </div>
        <div className="md:w-full flex justify-center max-md:flex-col max-md:gap-2">
          <a
            href="tel:+38971399036"
            className="py-[14px] px-[20px] mx-[7px] bg-[#FDC700] font-bold leading-[20px] flex items-center justify-center gap-2 max-h-[48px]"
          >
            <img src="/logos/mobile-phone.svg" className="w-8 h-7" />

            <span className="max-md:text-[14px]">+389 71 399 036</span>
          </a>
          <a
            href="mailto:info@proteini.si"
            className="py-[14px] px-[20px] mx-[7px] bg-[#FDC700] font-bold leading-[20px] flex items-center justify-center gap-2 max-h-[48px]"
          >
            <img src="/logos/email.svg" className="w-7 h-7" />
            <span className="max-md:text-[14px]"> makedonija@proteini.si</span>
          </a>
        </div>
      </div>
    </div>
  );
}
