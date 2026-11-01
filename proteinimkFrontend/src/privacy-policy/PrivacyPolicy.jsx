import { useLanguage } from "../Pages/translation/LanguageContext";

export default function PrivacyPolicy() {
  const { translate } = useLanguage();
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-[1240px] flex flex-col pt-[70px] pr-[50px] max-md:px-12">
        <div className="flex gap-2 items-center pb-[14px]">
          <p className="text-[20px] text-[#828282] hover:text-black hover:cursor-pointer">
            {translate("home")}
          </p>
          <img width={26} src="/logos/right-arrow.svg" alt="arrow" />
          <p className="text-[20px] font-bold">{translate("privacyPolicy")}</p>
        </div>

        <p className="text-[20px] mb-[16px] font-bold">
          {translate("generalProvisions")}
        </p>
        <p className="text-[16px] mb-[20px] font-bold">
          {translate("dataOfTheController")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mb-[16px] mt-[20px]">
            {translate("controllerDescription")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerOfUsersData")}
          </p>
          <p className="text-[16px]">
            {translate("legalEntityName")}
            <br />
            {translate("legalEntityAddress")}
            <br />
            {translate("postcodeAndPlace")}
            <br />
            {translate("vatNumber")}
            <br />
            {translate("registrationNumber")}
            <br />
            {translate("contactEmail")}
            <br />
            {translate("contactPhone")}
            <br />
            {translate("entryData")}
          </p>
        </div>

        <p className="text-[16px] mb-[16px] font-bold">
          {translate("dataOfTheProcessor")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mb-[16px] mt-[20px]">
            {translate("processorDescription")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong> {translate("processor1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong> {translate("processor2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong> {translate("processor3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong> {translate("processor4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong> {translate("processor5")}
            </li>
          </ol>
        </div>

        <p className="text-[16px] mb-[16px] font-bold">
          {translate("website")}
        </p>
        <p className="mb-[40px] text-[16px] mt-[20px]">
          {translate("privacyPolicyIntendedFor")}{" "}
          <b className="font-bold">proteini.si</b>
        </p>

        <p className="mb-[16px] font-bold">{translate("legislation")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("slovenianAndEuropeanLegislations")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("privacyPolicyPreparedAccordingTo")}
          </p>
        </div>

        <p className="mb-[40px] font-bold">{translate("legalPrinciples")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt[20px]">
            {translate("controllerAndProcessorsRespect")}
          </p>
          <p className="text-[16px] mt-[20px]">1. {translate("principle1")}</p>
          <p className="text-[16px]">2. {translate("principle2")}</p>
          <p className="text-[16px]">3. {translate("principle3")}</p>
          <p className="text-[16px]">4. {translate("principle4")}</p>
          <p className="text-[16px]">5. {translate("principle5")}</p>
          <p className="text-[16px]">6. {translate("principle6")}</p>
        </div>

        <p className="mb-[16px] font-bold">{translate("definitionsOfTerms")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("privacyPolicyApplies")}
            <p>{translate("personalDataDefinition")}</p>
            {translate("identifiableIndividual")}
          </p>
          <p>{translate("userDefinition")}</p>
          <p>{translate("controllerDefinition")}</p>
          <p>{translate("processorDefinition")}</p>
          <p>{translate("subprocessorDefinition")}</p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("processingOfUsersPersonalData")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("processingDefinition")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerMayProcessOnlyIf")}
          </p>
          <p className="text-[16px]">
            {translate("processingContent1")}
            <br />
            {translate("processingContent2")}
            <br />
            {translate("processingContent3")}
            <br />
            {translate("processingContent4")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("ifControllerProcessesForNewPurposes")}
          </p>
          <p className="text-[16px]">
            {translate("newPurposes1")}
            <br />
            {translate("newPurposes2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerEnsuresPurposes")}
          </p>
        </div>

        <p className="mb-[40px] font-bold mt-[20px]">
          {translate("retentionPeriodsForPersonalData")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px]">{translate("retentionDescription")}</p>
          <p className="text-[16px] mt-[40px] font-bold">
            {translate("retentionPeriodsSpecified")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("disclosureAndTransfer")}
        </p>
        <div className="mb-[20px] mt-[20px]">
          <p className="text-[16px] mb-[40px]">
            {translate("controllerDisclosesInFollowingCases")}
          </p>
          <p className="text-[16px] font-bold mt-[40px]">
            {translate("disclosureRequiredByLaw")}
          </p>
          <p className="text-[16px]">
            {translate("disclosureRequiredByLawText")}
          </p>
          <p className="text-[16px] font-bold mt-[40px]">
            {translate("transferToThirdCountries")}
          </p>
          <p className="text-[16px]">
            {translate("transferToThirdCountriesText")}
          </p>
          <p className="text-[16px] font-bold mt-[40px]">
            {translate("disclosureToContractualProcessors")}
          </p>
          <p className="text-[16px]">
            {translate("disclosureToContractualProcessorsText")}
          </p>
        </div>

        <p className="mb-[20px] mt-[20px] font-bold">
          {translate("useOfCookies")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">{translate("cookiesNotice")}</p>
          <p className="text-[16px] mt-[40px]">
            {translate("cookiesWithoutConsent")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("cookiesNoticeWithConsent")}
          </p>
          <p className="text-[16px]">
            {translate("cookieInfo1")}
            <br />
            {translate("cookieInfo2")}
            <br />
            {translate("cookieInfo3")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("userResponsibilities")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] font-bold mt-[20px]">
            {translate("accuracyAndTruthfulness")}
          </p>
          <p className="text-[16px]">
            {translate("accuracyAndTruthfulnessText")}
          </p>
          <p className="text-[16px] font-bold mt-[40px]">
            {translate("confidentialityOfCredentials")}
          </p>
          <p className="text-[16px]">
            {translate("confidentialityOfCredentialsText")}
          </p>
          <p className="text-[16px] font-bold mt-[40px]">
            {translate("prohibitionOfMisuse")}
          </p>
          <p className="text-[16px]">{translate("prohibitionOfMisuseText")}</p>
          <p className="text-[16px] font-bold mt-[40px]">
            {translate("consequencesOfViolations")}
          </p>
          <p className="text-[16px]">
            {translate("consequencesOfViolationsText")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">{translate("publicPostsByUsers")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("publicPostsExamples")}
          </p>
          <p className="text-[16px] font-bold">
            {translate("publicPost1")}
            <br />
            {translate("publicPost2")}
            <br />
            {translate("publicPost3")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("publicPostDataText")}
          </p>
        </div>

        <p className="mb-[40px] font-bold">{translate("additionalWarnings")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] font-bold">
            {translate("controllerSpecificallyWarns")}
          </p>
          <p className="text-[16px]">{translate("rightToUnsubscribe")}</p>
        </div>

        <p className="text-[20px] mb-[16px] font-bold">
          {translate("legislativeBasis")}
        </p>

        <p className="mb-[16px] font-bold">{translate("contractualBasis")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("contractualBasisForProcessing")}
          </p>
          <p className="text-[16px]">
            {translate("contractualBasis1")}
            <br />
            {translate("contractualBasis2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("contractualBasisInfo")}
          </p>
          <p className="text-[16px] mt-[40px] font-bold">
            {translate("contractualBasisNoExplicitConsent")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("contractualBasisIfUserFails")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">{translate("legalBasis")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">{translate("legalBasisText")}</p>
          <p className="text-[16px] mt-[40px]">
            {translate("legalObligationsInSlovenia")}
          </p>
          <p className="text-[16px]">
            {translate("legalObligation1")}
            <br />
            {translate("legalObligation2")}
            <br />
            {translate("legalObligation3")}
            <br />
            {translate("legalObligation4")}
            <br />
            {translate("legalObligation5")}
            <br />
            {translate("legalObligation6")}
          </p>
          <p className="text-[16px] mt-[40px] font-bold">
            {translate("legalBasisNoExplicitConsent")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">{translate("explicitConsent")}</p>
        <div className="mb-[40px] mt-[20px]">
          <p className="text-[16px]">{translate("explicitConsentText")}</p>
          <p className="text-[16px] mt-[40px]">
            {translate("userConsentValidWhen")}
          </p>
          <p className="text-[16px]">
            {translate("consentCriteria1")}
            <br />
            {translate("consentCriteria2")}
            <br />
            {translate("consentCriteria3")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerEnsuresInformationPrior")}
          </p>
          <p className="text-[16px]">
            {translate("consentMethod1")}
            <br />
            {translate("consentMethod2")}
            <br />
            {translate("consentMethod3")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerMaintainsRecord")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">{translate("legitimateInterest")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("legitimateInterestText")}
          </p>
          <p className="text-[16px] mt-[40px]">{translate("balancingTest")}</p>
          <p className="text-[16px]">
            {translate("balancingTest1")}
            <br />
            {translate("balancingTest2")}
            <br />
            {translate("balancingTest3")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("examplesOfLegitimateInterests")}
          </p>
          <p className="text-[16px]">
            {translate("legitimateInterestExample1")}
            <br />
            {translate("legitimateInterestExample2")}
            <br />
            {translate("legitimateInterestExample3")}
          </p>
        </div>

        <p className="mb-[40px] font-bold">
          {translate("parentalOrGuardianConsent")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px]">{translate("parentalConsentText")}</p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerMayRequestVerification")}
          </p>
          <p className="text-[16px]">
            {translate("verificationMethod1")}
            <br />
            {translate("verificationMethod2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerProcessesChildrenData")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("parentsOrGuardiansResponsible")}
          </p>
        </div>

        <p className="text-[20px] mb-[16px] font-bold">
          {translate("personalDataAndPurposes")}
        </p>

        <p className="mb-[16px] font-bold">
          {translate("fulfillmentOfContractualObligations")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[40px]">
            {translate("fulfillmentText")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px]">
            {translate("fulfillmentLegalBasis")}
          </p>

          <p className="text-[16px] mt-[20px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("personalDataItem4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong>
              {translate("personalDataItem5")}
            </li>
            <li className="pb-[15px]">
              <strong>6. </strong>
              {translate("personalDataItem6")}
            </li>
            <li className="pb-[15px]">
              <strong>7. </strong>
              {translate("personalDataItem7")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("sendingInfoAndNotifications")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("sendingInfoText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("sendingInfoLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem4")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("respondingToUserInquiries")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">{translate("respondingText")}</p>
          <p className="text-[16px] mt-[40px]">
            {translate("respondingLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem4")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">{translate("userRegistration")}</p>
        <div className="mb-[20px]">
          <p className="text-[16px] mt-[20px]">
            {translate("registrationText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("registrationLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("personalDataItem4")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("fulfillingLegalObligations")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("fulfillingLegalText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("fulfillingLegalLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("personalDataItem4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong>
              {translate("personalDataItem5")}
            </li>
            <li className="pb-[15px]">
              <strong>6. </strong>
              {translate("personalDataItem6")}
            </li>
            <li className="pb-[15px]">
              <strong>7. </strong>
              {translate("personalDataItem7")}
            </li>
            <li className="pb-[15px]">
              <strong>8. </strong>
              {translate("ipAddress")}
            </li>
            <li className="pb-[15px]">
              <strong>9. </strong>
              {translate("cookieId")}
            </li>
            <li className="pb-[15px]">
              <strong>10. </strong>
              {translate("accessLogs")}
            </li>
            <li className="pb-[15px]">
              <strong>11. </strong>
              {translate("contentOfCommunication")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("protectionOfLegitimateInterests")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[40px]">{translate("protectionText")}</p>
          <p className="text-[16px] mt-[40px]">
            {translate("protectionLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("personalDataItem4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong>
              {translate("personalDataItem5")}
            </li>
            <li className="pb-[15px]">
              <strong>6. </strong>
              {translate("personalDataItem6")}
            </li>
            <li className="pb-[15px]">
              <strong>7. </strong>
              {translate("personalDataItem7")}
            </li>
            <li className="pb-[15px]">
              <strong>8. </strong>
              {translate("ipAddress")}
            </li>
            <li className="pb-[15px]">
              <strong>9. </strong>
              {translate("cookieId")}
            </li>
            <li className="pb-[15px]">
              <strong>10. </strong>
              {translate("accessLogs")}
            </li>
            <li className="pb-[15px]">
              <strong>11. </strong>
              {translate("contentOfCommunication")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("directMarketingWithoutConsent")}
        </p>
        <div className="mb-[40px] mt-[20px]">
          <p className="text-[16px]">
            {translate("directMarketingWithoutText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("directMarketingWithoutLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem4")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("directMarketingWithConsent")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("directMarketingWithText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("directMarketingWithLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem4")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("profilingForTargetedAdvertising")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("profilingForTargetedText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("profilingForTargetedLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("profilingForTargetedPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("targetedPersonalData1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("targetedPersonalData2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("targetedPersonalData3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("targetedPersonalData4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong>
              {translate("targetedPersonalData5")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("profilingForRemarketing")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("profilingForRemarketingText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("profilingForRemarketingLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("remarketingPersonalData1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("remarketingPersonalData2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("remarketingPersonalData3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("remarketingPersonalData4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong>
              {translate("remarketingPersonalData5")}
            </li>
            <li className="pb-[15px]">
              <strong>6. </strong>
              {translate("remarketingPersonalData6")}
            </li>
            <li className="pb-[15px]">
              <strong>7. </strong>
              {translate("remarketingPersonalData7")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("executionOfPrizeCompetition")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("executionOfPrizeText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("executionOfPrizeLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("personalDataItem1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("personalDataItem2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("personalDataItem3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("personalDataItem4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong>
              {translate("personalDataItem7")}
            </li>
            <li className="pb-[15px]">
              <strong>6. </strong>
              {translate("personalDataItem5")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("improvingUserExperience")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("improvingUserExperienceText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("improvingUserExperienceLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("improvingPersonalData1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("improvingPersonalData2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("improvingPersonalData3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("improvingPersonalData4")}
            </li>
            <li className="pb-[15px]">
              <strong>5. </strong>
              {translate("improvingPersonalData5")}
            </li>
            <li className="pb-[15px]">
              <strong>6. </strong>
              {translate("improvingPersonalData6")}
            </li>
            <li className="pb-[15px]">
              <strong>7. </strong>
              {translate("improvingPersonalData7")}
            </li>
          </ol>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("monitoringStatisticalData")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("monitoringStatisticalText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("monitoringStatisticalText2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("monitoringStatisticalLegalBasis")}
          </p>
          <p className="text-[16px] mt-[40px] mb-[40px] font-bold">
            {translate("fulfillmentPersonalData")}
          </p>
          <ol className="text-[16px] mt-[40px]">
            <li className="pb-[15px]">
              <strong>1. </strong>
              {translate("monitoringPersonalData1")}
            </li>
            <li className="pb-[15px]">
              <strong>2. </strong>
              {translate("monitoringPersonalData2")}
            </li>
            <li className="pb-[15px]">
              <strong>3. </strong>
              {translate("monitoringPersonalData3")}
            </li>
            <li className="pb-[15px]">
              <strong>4. </strong>
              {translate("monitoringPersonalData4")}
            </li>
          </ol>
        </div>

        <p className="text-[20px] mb-[16px] font-bold">
          {translate("userRights")}
        </p>

        <p className="mb-[16px] font-bold">
          {translate("generalInfoAboutRights")}
        </p>
        <div className="mb-[40px] mt-[36px]">
          <p className="text-[16px]">{translate("userMayRequest")}</p>
          <p className="text-[16px] font-bold">
            {translate("right1")}
            <br className="font-bold" />
            {translate("right2")}
            <br />
            {translate("right3")}
            <br />
            {translate("right4")}
            <br />
            {translate("right5")}
            <br />
            {translate("right6")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("additionalRights")}
          </p>
          <p className="text-[16px] font-bold">
            {translate("additionalRight7")}
            <br />
            {translate("additionalRight8")}
            <br />
            {translate("additionalRight9")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerWillRespond")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("ifRequestIsComplex")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("ifControllerDoesNotAct")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("usersMayAddressRequests")}
          </p>
        </div>

        <p className="mb-[40px] font-bold">{translate("rightToAccessData")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px]">{translate("rightToAccessText")}</p>
          <p className="text-[16px] font-bold">
            {translate("controllerShallProvide")}
          </p>
          <p className="text-[16px]">
            {translate("accessInfo1")}
            <br />
            {translate("accessInfo2")}
            <br />
            {translate("accessInfo3")}
            <br />
            {translate("accessInfo4")}
            <br />
            {translate("accessInfo5")}
            <br />
            {translate("accessInfo6")}
            <br />
            {translate("accessInfo7")}
            <br />
            {translate("accessInfo8")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("exerciseRightsForm")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("rightToRectification")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("rightToRectificationText")}
          </p>
          <p className="text-[16px]">
            {translate("rectification1")}
            <br />
            {translate("rectification2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("exerciseRightsForm")}
          </p>
        </div>

        <p className="mb-[40px] font-bold">{translate("rightToErasure")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px]">{translate("rightToErasureText")}</p>
          <p className="text-[16px]">
            {translate("erasureCondition1")}
            <br />
            {translate("erasureCondition2")}
            <br />
            {translate("erasureCondition3")}
            <br />
            {translate("erasureCondition4")}
            <br />
            {translate("erasureCondition5")}
            <br />
            {translate("erasureCondition6")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("exerciseRightsForm")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">{translate("rightToRestriction")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("rightToRestrictionText")}
          </p>
          <p className="text-[16px]">
            {translate("restrictionCase1")}
            <br />
            {translate("restrictionCase2")}
            <br />
            {translate("restrictionCase3")}
            <br />
            {translate("restrictionCase4")}
          </p>
          <p className="text-[16px] mt-[40px] font-bold">
            {translate("whenUserExercisingThisRight")}
          </p>
          <p className="text-[16px]">
            {translate("restrictionException1")}
            <br />
            {translate("restrictionException2")}
            <br />
            {translate("restrictionException3")}
            <br />
            {translate("restrictionException4")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("exerciseRightsForm")}
          </p>
        </div>

        <p className="mb-[16px] mt-[20px] font-bold">
          {translate("rightToDataPortability")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("rightToDataPortabilityText")}
          </p>
          <p className="text-[16px]">
            {translate("portabilityFormat1")}
            <br />
            {translate("portabilityFormat2")}
            <br />
            {translate("portabilityFormat3")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("portabilityRightText")}
          </p>
          <p className="text-[16px]">
            {translate("portabilityCondition1")}
            <br />
            {translate("portabilityCondition2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("portabilityTechnicallyFeasible")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("exerciseRightsForm")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">{translate("rightToObject")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("rightToObjectText")}
          </p>
          <p className="text-[16px]">
            {translate("objectCase1")}
            <br />
            {translate("objectCase2")}
          </p>
          <p className="text-[16px] mt-[40px] font-bold">
            {translate("controllerShallNotCease")}
          </p>
          <p className="text-[16px]">
            {translate("objectException1")}
            <br />
            {translate("objectException2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerShallAlwaysGrant")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerShallProvideClearInfo")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("exerciseRightsForm")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("rightRelatedToAutomatedProcessing")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("rightRelatedToAutomatedText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("userCannotExerciseRight")}
          </p>
          <p className="text-[16px]">
            {translate("automatedException1")}
            <br />
            {translate("automatedException2")}
            <br />
            {translate("automatedException3")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("whereExplicitConsentRequired")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("rightToWithdrawExplicitConsent")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("rightToWithdrawText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("userCanWithdraw")}
          </p>
          <p className="text-[16px]">
            {translate("withdrawType1")}
            <br />
            {translate("withdrawType2")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("generalConsentWithdrawn")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("consentForDirectMarketing")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerEnablesWithdrawal")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("rightToLodgeComplaint")}
        </p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("rightToLodgeText")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("competentAuthority")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("userMayFileComplaintIf")}
          </p>
          <p className="text-[16px] font-bold">
            {translate("complaintReason1")}
            <br />
            {translate("complaintReason2")}
            <br />
            {translate("complaintReason3")}
          </p>
          <p className="text-[16px] mt-[40px]">
            {translate("controllerInformsUser")}
          </p>
        </div>

        <p className="text-[20px] mb-[16px] font-bold">
          {translate("copyright")}
        </p>

        <p className="mb-[16px] font-bold">{translate("contentsAndTexts")}</p>
        <p className="mb-[40px] text-[16px] mt-[20px]">
          {translate("contentsAndTextsText")}
        </p>

        <p className="mb-[16px] font-bold">
          {translate("photographsAndAudiovisual")}
        </p>
        <p className="mb-[40px] text-[16px] mt-[20px]">
          {translate("photographsAndAudiovisualText")}
        </p>

        <p className="mb-[16px] font-bold">{translate("legalDocument")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("legalDocumentText")}
          </p>
          <p className="text-[16px] font-bold">
            {translate("legalDocumentNote")}
          </p>
        </div>

        <p className="text-[20px] mb-[16px] font-bold">
          {translate("finalProvisions")}
        </p>

        <p className="mb-[40px] font-bold">{translate("bindingNature")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px]">{translate("bindingNature1")}</p>
          <p className="text-[16px]">{translate("bindingNature2")}</p>
          <p className="text-[16px]">{translate("bindingNature3")}</p>
          <p className="text-[16px]">{translate("bindingNature4")}</p>
        </div>

        <p className="mb-[40px] font-bold">{translate("amendments")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px]">{translate("amendments1")}</p>
          <p className="text-[16px]">{translate("amendments2")}</p>
          <p className="text-[16px]">{translate("amendments3")}</p>
        </div>

        <p className="mb-[16px] font-bold">{translate("disputeResolution")}</p>
        <div className="mb-[40px]">
          <p className="text-[16px] mt-[20px]">
            {translate("disputeResolutionText")}
          </p>
        </div>

        <p className="mb-[16px] font-bold">
          {translate("territorialValidity")}
        </p>
        <p className="mb-[40px] mt-[30px] text-[16px]">
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
