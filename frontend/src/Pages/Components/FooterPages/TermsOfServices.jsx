import { useLanguage } from "../../translation/LanguageContext";

export default function TermsOfServices() {
  const { translate } = useLanguage();
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1240px] flex flex-col pt-[70px] pr-[50px] max-md:px-12">
        <div className="flex gap-2 items-center pb-[14px]">
          <p className="text-[20px] text-[#828282] hover:text-black hover:cursor-pointer">
            {translate("home")}
          </p>
          <img width={26} src="/logos/right-arrow.svg" />
          <p className="text-[20px] font-bold">{translate("termsOfService")}</p>
        </div>
        <p className="text-[20px] mb-[16px] font-bold">
          {translate("generalProvisions")}
        </p>
        <p className="text-[16px] mb-[16px] font-bold">
          {translate("informationAboutTheProvider")}
        </p>
        <div>
          <p className="text-[16px] font-bold mt-[40px]">
            {translate("providerOfProductsAndServicesIs")}
          </p>
          <p className="text-[16px] mb-[40px]">
            <p>{translate("legalEntityName")}</p>
            <>{translate("legalEntityAddress")}</>
            <p>{translate("postcodeAndPlace")}</p>
            <p>{translate("vatNumber")}</p>
            <p>{translate("registrationNumber")}</p>
            <p>{translate("contactEmail")}</p>
            <p>{translate("contactPhone")}</p>
            <p>{translate("entryData")}</p>
          </p>
          <p className="text-[16px] mb-[16px] font-bold">
            {translate("additionalWarnings")}
          </p>
          <div className="text-[16px] mb-[40px]">
            <p className="font-bold mt-[40px]">
              {translate("providerSpecificallyWarns")}
            </p>
            <p>{translate("warningText")}</p>
          </div>
          <p className="font-bold mb-[16px] text-[16px]">
            {translate("webSite")}
          </p>
          <p className="mb-[40px] text-[16px]">
            {translate("termsAndConditionsIntendedFor")}{" "}
            <b className="font-bold">proteini.si/en/</b>
          </p>
        </div>
        <p className="mb-[16px] font-bold">{translate("legislation")}</p>
        <div className="mb-[40px]">
          <p>
            {translate("forTheInterpretation")}{" "}
            {translate("ofTheseTermsAndConditions")}{" "}
            {translate("theSlovenianLegislationShallApply")}
            {translate("theseTermsAndConditionsHaveBeenDrawnUp")}{" "}
            {translate("codeOfObligations")} ({translate("oz")}, Official
            Gazette no. 83/01 as amend.),
            {translate("electronicBusinessAndElectronicSignatureAct")} (
            {translate("zepep")}, Official Gazette no. 57/00 as amend.),
            {translate("electronicCommerceMarketAct")} ({translate("zept")},
            Official Gazette no. 61/06 as amend.),
            {translate("electronicCommunicationsAct")} ({translate("zekom2")},
            Official Gazette no. 130/22 as amend.),
            {translate("copyrightAndRelatedRightsAct")} ({translate("zasp")},
            Official Gazette no. 21/95 as amend.),
            {translate("consumerProtectionAct")} ({translate("zvpot1")},
            Official Gazette no. 130/22 as amend.){" "}
            {translate("andOtherSectoralNationalAndEuropeanLegislation")}
          </p>
        </div>
        <p className="font-bold mb-[16px]">{translate("legalPrinciples")}</p>
        <div className="mb-[40px]">
          <p>1. {translate("principle1Text")}</p>
          <p>2. {translate("principle2Text")}</p>
          <p>3. {translate("principle3Text")}</p>
          <p>4. {translate("principle4Text")}</p>
        </div>
        <p className="mb-[16px] text-[20px] font-bold">
          {translate("useOfWebsite")}
        </p>
        <p className="mb-[16px] font-bold">{translate("meaningOfUse")}</p>
        <div className="mb-[40px]">
          <p className="font-bold mt-[40px]">
            {translate("theUseOfThisWebsiteMeans")}
          </p>
          <p>{translate("usePoint1")}</p>
          <p>{translate("usePoint2")}</p>
          <p>{translate("usePoint3")}</p>
          <p>{translate("usePoint4")}</p>
          <p>{translate("usePoint5")}</p>
          <p>{translate("usePoint6")}</p>
          <p>{translate("usePoint7")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("rulesOfUse")}</p>
        <div className="mb-[40px]">
          <p className="font-bold mt-[40px]">
            {translate("customersMustUseTheWebsiteResponsibly")}
          </p>
          <p>{translate("rule1")}</p>
          <p>{translate("rule2")}</p>
          <p>{translate("rule3")}</p>
          <p>{translate("rule4")}</p>
          <p>{translate("rule5")}</p>
          <p>{translate("rule6")}</p>
          <p>{translate("rule7")}</p>
          <p>{translate("rule8")}</p>
          <p>{translate("rule9")}</p>
        </div>
        <p className="font-bold mb-[16px]">
          {translate("responsibilityOfContent")}
        </p>
        <p className="mb-[40px] mt-[20px]">
          {translate("responsibleForOperations")}.{" "}
          {translate("eliminateTechnicalAndSubstantiveErrors")}.
        </p>
        <div className="mb-[40px]">
          <p>{translate("providerDoesNotAssumeResponsibility")}</p>
          <p>{translate("responsibilityCase1")}</p>
          <p>{translate("responsibilityCase2")}</p>
          <p>{translate("responsibilityCase3")}</p>
          <p>{translate("responsibilityCase4")}</p>
          <p>{translate("responsibilityCase5")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("responsibilitiesForUse")}
        </p>
        <div className="mb-[40px] mt-[20px]">
          <p>{translate("responsibilityForUse1")}</p>
          <p>{translate("responsibilityForUse2")}</p>
          <p>{translate("responsibilityForUse3")}</p>
          <p>{translate("responsibilityForUse4")}</p>
          <p>{translate("responsibilityForUse5")}</p>
        </div>
        <p className="font-bold mb-[16px]">
          {translate("customerRegistration")}
        </p>
        <div className="mt-[20px] mb-[40px]">
          <p>{translate("registration1")}</p>
          <p>{translate("registration2")}</p>
          <p>{translate("registration3")}</p>
        </div>
        <p className="font-bold mb-[16px]">{translate("rulesOfCommenting")}</p>
        <div className="mt-[20px] mb-[40px]">
          <p>{translate("commentRule1")}</p>
          <p>{translate("commentRule2")}</p>
          <p>{translate("commentRule3")}</p>
          <p>{translate("commentRule4")}</p>
          <p>{translate("commentRule5")}</p>
        </div>
        <p className="font-bold text-[20px] mb-[16px]">
          {translate("copyrights")}
        </p>
        <p className="mb-[16px] font-bold">{translate("contentsAndTexts")}</p>
        <p className="mb-[40px] mt-[20px]">
          {translate("contentsAndTextsText")}
        </p>
        <p className="mb-[16px] font-bold">
          {translate("photographsAndAudiovisualWorks")}
        </p>
        <p className="mb-[40px] mt-[20px]">
          {translate("photographsAndAudiovisualText")}
        </p>
        <p className="mb-[16px] font-bold">{translate("legalDocument")}</p>
        <div className="mb-[40px] mt-[20px]">
          <p>{translate("legalDocumentText")}</p>
          <p className="font-bold">{translate("legalDocumentNote")}</p>
        </div>
        <p className="font-bold text-[20px] mb-[16px]">
          {translate("saleOfProducts")}
        </p>
        <p className="mb-[16px] font-bold">{translate("productOffer")}</p>
        <p className="mb-[40px] text-[16px]">{translate("productOfferText")}</p>
        <p className="mb-[16px] font-bold">{translate("orderProcedure")}</p>
        <p className="mb-[40px] text-[16px]">
          {translate("orderProcedureText")}
        </p>
        <p className="mb-[16px] font-bold">{translate("productPrices")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("price1")}</p>
          <p>{translate("price2")}</p>
          <p>{translate("price3")}</p>
          <p>{translate("price4")}</p>
        </div>
        <p className="mb-[40px] font-bold">{translate("paymentMethods")}</p>
        <p className="mb-[40px] text-[16px]">
          {translate("paymentMethodsText")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <ul className="text-[16px] ">
            <li className="pb-[15px]">{translate("paymentMethod1")}</li>
            <li className="pb-[15px]">{translate("paymentMethod2")}</li>
            <li className="pb-[15px]">{translate("paymentMethod3")}</li>
            <li className="pb-[15px]">{translate("paymentMethod4")}</li>
            <li className="pb-[15px]">{translate("paymentMethod5")}</li>
          </ul>
          <p className="mt-[20px]">{translate("paymentMethodFooter")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("giftVouchers")}</p>
        <div className="mb-[40px] text-[16px] mt-[20px]">
          <p>{translate("giftVouchersText")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("deliveryPeriod")}</p>
        <p className="mb-[40px] text-[16px]">
          {translate("deliveryPeriodText")}
        </p>
        <p className="mb-[16px] font-bold">{translate("deliveryCosts")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("deliveryCosts1")}</p>
          <p className="mt-[20px]">{translate("deliveryCosts2")}</p>
          <p className="mt-[20px]">{translate("deliveryCosts3")}</p>
          <p className="mt-[20px]">{translate("deliveryCosts4")}</p>
          <p className="mt-[20px]">{translate("deliveryCosts5")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("limitsOfLiability")}</p>
        <p className="mb-[40px] text-[16px]">
          {translate("limitsOfLiabilityText")}
        </p>
        <p className="mb-[16px] font-bold">
          {translate("productConformityWarranty")}
        </p>
        <div className="mb-[40px] text-[16px] mt-[20px]">
          <p>{translate("warranty1")}</p>
          <p className="mt-[40px]">{translate("warranty2")}</p>
          <p className="mt-[40px]">{translate("warranty3")}</p>
          <p className="mt-[40px]">{translate("warranty4")}</p>
          <p className="mt-[40px]">{translate("warranty5")}</p>
          <p className="mt-[40px]">{translate("warranty6")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("warrantyClaims")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("warrantyClaimsText")}</p>
          <p>{translate("warrantyClaimsEmail")}</p>
          <p>{translate("warrantyClaimsAddress")}</p>
          <p className="font-bold">{translate("warrantyClaimsMustInclude")}</p>
          <p>{translate("warrantyClaim1")}</p>
          <p>{translate("warrantyClaim2")}</p>
          <p>{translate("warrantyClaim3")}</p>
          <p>{translate("warrantyClaim4")}</p>
          <p>{translate("warrantyClaim5")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("guarantees")}</p>
        <div className="mb-[40px] text-[16px]">
          <p className="mt-[20px]">{translate("guarantees1")}</p>
          <p className="mt-[40px] font-bold">{translate("guarantees2")}</p>
          <p className="mt-[40px]">{translate("guarantees3")}</p>
          <p className="mt-[40px]">{translate("guarantees4")}</p>
          <p className="mt-[40px]">{translate("guarantees5")}</p>
          <p className="mt-[40px]">{translate("guarantees6")}</p>
          <p className="mt-[40px]">{translate("guarantees7")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("guaranteeClaims")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("guaranteeClaimsText")}</p>
          <p>{translate("guaranteeClaimsEmail")}</p>
          <p>{translate("guaranteeClaimsAddress")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("withdrawalFromContract")}
        </p>
        <div>
          <p className="mb-[40px] text-[16px] mt-[20px]">
            {translate("withdrawal1")} {translate("withdrawal2")}{" "}
            {translate("withdrawal3")} {translate("withdrawal4")}{" "}
            {translate("withdrawal5")}
          </p>
          <p className="mt-[20px] mb-[40px] font-bold">
            {translate("withdrawalNoRight")}
          </p>
          <ul className="text-[16px] pb-[15px]">
            <li className="pb-[15px]">{translate("noRight1")}</li>
            <li className="pb-[15px]">{translate("noRight2")}</li>
            <li className="pb-[15px]">{translate("noRight3")}</li>
            <li className="pb-[15px]">{translate("noRight4")}</li>
            <li className="pb-[15px]">{translate("noRight5")}</li>
            <li className="pb-[15px]">{translate("noRight6")}</li>
            <li className="pb-[15px]">{translate("noRight7")}</li>
            <li className="pb-[15px]">{translate("noRight8")}</li>
            <li className="pb-[15px]">{translate("noRight9")}</li>
            <li className="pb-[15px]">{translate("noRight10")}</li>
          </ul>
          <p className="mt-[20px] font-bold mb-[40px]">
            {translate("withdrawalNoRightNote")}
          </p>
        </div>
        <p className="mb-[40px] font-bold">
          {translate("enforcementOfWithdrawal")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("enforcementOfWithdrawalText")}</p>
          <p>{translate("enforcementOfWithdrawalEmail")}</p>
          <p>{translate("enforcementOfWithdrawalAddress")}</p>
        </div>
        <p className="mb-[40px] font-bold">{translate("formForWithdrawal")}</p>
        <p className="mb-[40px] text-[16px]">
          {translate("formForWithdrawalText")}
        </p>
        <p className="mb-[40px] font-bold">
          {translate("addressForComplaints")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("addressForComplaintsText")}</p>
          <p>{translate("addressForComplaintsEmail")}</p>
          <p>{translate("addressForComplaintsAddress")}</p>
        </div>
        <p className="mb-[40px] font-bold">{translate("reviewOfProducts")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("reviewOfProductsText")}</p>
        </div>
        <p className="mb-[40px] font-bold">
          {translate("productMaintenanceAndInstructions")}
        </p>
        <p className="mb-[40px] text-[16px]">
          {translate("productMaintenanceAndInstructionsText")}
        </p>
        <p className="mb-[40px] font-bold">{translate("specialAgreements")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("specialAgreements1")}</p>
          <p className="mt-[20px] font-bold">
            {translate("specialAgreements2")}
          </p>
        </div>
        <p className="font-bold text-[20px] mb-[16px]">
          {translate("generalRulesOfThePrizeContest")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("generalRulesText")}</p>
          <p className="mt-[20px]">{translate("generalRulesSupplement")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("participants")}</p>
        <p className="mb-[40px] text-[16px]">{translate("participantsText")}</p>
        <p className="mb-[16px] font-bold">
          {translate("conditionsForParticipation")}
        </p>
        <ul className="mb-[40px] text-[16px] list-disc">
          <p className="mb-[40px] pb-[15px]">
            {translate("conditionsForParticipationText")}
          </p>
          <li className="pb-[15px] ml-[20px]">{translate("condition1")}</li>
          <li className="pb-[15px] ml-[20px]">{translate("condition2")}</li>
          <li className="pb-[15px] ml-[20px]">{translate("condition3")}</li>
          <li className="pb-[15px] ml-[20px]">{translate("condition4")}</li>
        </ul>
        <p className="mb-[16px] font-bold">
          {translate("methodOfParticipation")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("methodOfParticipationText")}</p>
          <p className="mt-[40px]">{translate("methodOfParticipation2")}</p>
          <p className="mt-[40px]">{translate("methodOfParticipation3")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("committee")}</p>
        <ul className="mb-[40px] text-[16px] list-disc">
          <p className="mb-[40px]">{translate("committeeText")}</p>
          <li className="pb-[15px] ml-[20px]">{translate("committeeTask1")}</li>
          <li className="pb-[15px] ml-[20px]">{translate("committeeTask2")}</li>
          <li className="pb-[15px] ml-[20px]">{translate("committeeTask3")}</li>
          <p className="mt-[20px]">{translate("committeeDecision")}</p>
        </ul>
        <p className="mb-[16px] font-bold">{translate("prizeDraw")}</p>
        <div className="mb-[40px] text-[16px]">
          <p className="mb-[40px]">{translate("prizeDrawText")}</p>
          <p className="mt-[20px]">{translate("prizeDraw2")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("publicationAndNotificationOfWinners")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("publicationAndNotificationText")}</p>
          <p className="mt-[40px]">
            {translate("publicationAndNotification2")}
          </p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("collectionAndTransferOfPrize")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("collectionAndTransferText")}</p>
          <p className="mt-[40px]">{translate("collectionAndTransfer2")}</p>
          <p className="mt-[40px] mb-[40px]">
            {translate("collectionAndTransfer3")}
          </p>
          <ul className="list-disc">
            <li className="pb-[15px] ml-[20px]">
              {translate("collectionMethod1")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("collectionMethod2")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("collectionMethod3")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("collectionMethod4")}
            </li>
          </ul>
          <p className="mt-[40px]">{translate("collectionAndTransfer4")}</p>
          <p className="mt-[40px]">{translate("collectionAndTransfer5")}</p>
          <p className="mt-[40px]">{translate("collectionAndTransfer6")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("incomeTaxPrepayment")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("incomeTaxPrepaymentText")}</p>
          <p className="mt-[40px]">{translate("incomeTaxPrepayment2")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("limitationOfLiabilityUntilDelivery")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("limitationOfLiabilityText")}</p>
          <p className="mt-[40px]">{translate("limitationOfLiability2")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("failureToAwardPrize")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p className="mb-[40px]">{translate("failureToAwardPrizeText")}</p>
          <ul className="list-disc">
            <li className="pb-[15px] ml-[20px]">
              {translate("failureReason1")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("failureReason2")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("failureReason3")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("failureReason4")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("failureReason5")}
            </li>
          </ul>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("violationOfTheRules")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("violationOfRulesText")}</p>
          <p className="mt-[40px]">{translate("violationOfRules2")}</p>
          <p className="mt-[40px]">{translate("violationOfRules3")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("protectionOfPersonalData")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("protectionOfPersonalDataText")}</p>
          <p className="mt-[40px] mb-[40px]">
            {translate("typesOfPersonalData")}
          </p>
          <ul className="list-disc">
            <li className="pb-[15px] ml-[20px]">
              {translate("personalDataType1")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("personalDataType2")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("personalDataType3")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("personalDataType4")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("personalDataType5")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("personalDataType6")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("personalDataType7")}
            </li>
          </ul>
          <p className="mt-[40px]">{translate("protectionOfPersonalData2")}</p>
          <p className="mt-[40px]">{translate("protectionOfPersonalData3")}</p>
          <p className="mt-[40px]">{translate("protectionOfPersonalData4")}</p>
          <p className="mt-[40px]">{translate("protectionOfPersonalData5")}</p>
          <p className="mt-[40px]">{translate("protectionOfPersonalData6")}</p>
          <p className="mt-[40px] mb-[40px]">
            {translate("protectionOfPersonalData7")}
          </p>
          <ul className="list-disc">
            <li className="pb-[15px] ml-[20px]">{translate("gdprRight1")}</li>
            <li className="pb-[15px] ml-[20px]">{translate("gdprRight2")}</li>
            <li className="pb-[15px] ml-[20px]">{translate("gdprRight3")}</li>
            <li className="pb-[15px] ml-[20px]">{translate("gdprRight4")}</li>
            <li className="pb-[15px] ml-[20px]">{translate("gdprRight5")}</li>
            <li className="pb-[15px] ml-[20px]">{translate("gdprRight6")}</li>
          </ul>
          <p className="mt-[20px]">{translate("protectionOfPersonalData8")}</p>
        </div>
        <p className="mb-[16px] font-bold">
          {translate("withdrawalFromPrizeContest")}
        </p>
        <p className="mb-[40px] text-[16px]">
          {translate("withdrawalFromPrizeContestText")}
        </p>
        <p className="mb-[16px] font-bold">
          {translate("limitationOfOrganizerLiability")}
        </p>
        <div className="mb-[40px] text-[16px]">
          <p className="mb-[40px]">
            {translate("limitationOfOrganizerLiabilityText")}
          </p>
          <ul className="list-disc">
            <li className="pb-[15px] ml-[20px]">
              {translate("organizerLiability1")}
            </li>
            <li className="pb-[15px] ml-[20px]">
              {translate("organizerLiability2")}
            </li>
          </ul>
          <p className="mt-[40px]">
            {translate("limitationOfOrganizerLiability2")}
          </p>
        </div>
        <p className="mb-[16px] font-bold">{translate("disputeSettlement")}</p>
        <p className="mb-[40px] text-[16px]">
          {translate("disputeSettlementText")}
        </p>
        <p className="font-bold text-[20px] mb-[16px]">
          {translate("finalProvisions")}
        </p>
        <p className="mb-[40px] font-bold">{translate("bindingNature")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("bindingNature1")}</p>
          <p>{translate("bindingNature2")}</p>
          <p>{translate("bindingNature3")}</p>
          <p>{translate("bindingNature4")}</p>
        </div>
        <p className="mb-[16px] font-bold">{translate("amendments")}</p>
        <div className="mb-[40px] text-[16px] mt-[20px]">
          <p>{translate("amendments1")}</p>
          <p>{translate("amendments2")}</p>
          <p>{translate("amendments3")}</p>
          <p>{translate("amendments4")}</p>
        </div>
        <p className="mb-[40px] font-bold">{translate("disputeResolution")}</p>
        <div className="mb-[40px] text-[16px]">
          <p>{translate("disputeResolutionText")}</p>
          <p className="mt-[40px]">{translate("disputeResolution2")}</p>
          <p className="mt-[40px]">{translate("disputeResolution3")}</p>
        </div>
        <p className="mb-[40px] font-bold">
          {translate("territorialValidity")}
        </p>
        <p className="mb-[40px] text-[16px]">
          {translate("territorialValidityText")}
        </p>
        <p className="mb-[16px] font-bold">{translate("temporalValidity")}</p>
        <p className="mb-[40px] text-[16px]">
          {translate("temporalValidityText")}
        </p>
      </div>
    </div>
  );
}
