import { useEffect, useState } from "react";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";
import {
  FiArrowUpRight,
  FiChevronRight,
  FiClock,
  FiMail,
  FiMapPin,
  FiNavigation,
  FiPhone,
  FiShoppingBag,
  FiUsers,
} from "react-icons/fi";
import "./Branches.css";

export default function Branches() {
  const { translate } = useLanguage();
  const [activeTab, setActiveTab] = useState("shops"); // "shops" or "gyms"
  const [selectedBranch, setSelectedBranch] = useState(0);
  const [managedLocations, setManagedLocations] = useState([]);

  // Shop locations
  // Shop locations (REAL UPDATED DATA)
  const shops = [
    {
      id: 1,
      name: "Proteini.si Shop",
      city: "Skopje - Centar",
      address: "Proteini.si Shop Skopje - Centar",
      phone: "+389 71 399 036",
      email: "makedonija@proteini.si",
      workingHours: {
        monFri: "10:00 - 22:00",
        sat: "Closed",
        sun: "Closed",
      },
      // Coordinates from the first URL
      coordinates: "41.9953182,21.4240556",
    },
    {
      id: 2,
      name: "Proteini.si Shop",
      city: "Skopje - Aerodrom",
      address: "Franjo Kluz 16, Skopje 1000",
      phone: "+389 71 399 036",
      email: "makedonija@proteini.si",
      workingHours: {
        monFri: "10:00 - 22:00",
        sat: "Closed",
        sun: "Closed",
      },
      // Address from the second URL
      coordinates: "Franjo+Kluz+16,+Skopje+1000",
    },
    {
      id: 3,
      name: "Proteini.si Shop",
      city: "Tetovo",
      address: "Ilirija bb, Tetovo 1200",
      phone: "+389 71 399 036",
      email: "makedonija@proteini.si",
      workingHours: {
        monFri: "10:00 - 22:00",
        sat: "Closed",
        sun: "Closed",
      },
      // Address from the third URL
      coordinates: "Ilirija+bb,+Tetovo+1200",
    },
    {
      id: 4,
      name: "Proteini.si Shop",
      city: "Kumanovo",
      address: "La Plaza Mall, III-ta Makedonska Udarna Brigada 23, Kumanovo",
      phone: "+389 71 399 036",
      email: "makedonija@proteini.si",
      workingHours: {
        monFri: "10:00 - 22:00",
        sat: "Closed",
        sun: "Closed",
      },
      // Address from the fourth URL
      coordinates:
        "La+Plaza+Mall,+III-ta+Makedonska+Udarna+Brigada+23,+Kumanovo",
    },
    {
      id: 5,
      name: "Proteini.si Shop",
      city: "Skopje - Diamond Mall",
      address: "Diamond Mall, Jordan Mijalkov 31, 1000 Skopje",
      phone: "+389 71 399 036",
      email: "makedonija@proteini.si",
      workingHours: {
        monFri: "10:00 - 22:00",
        sat: "Closed",
        sun: "Closed",
      },
      // Address from the fifth URL
      coordinates: "Jordan+Mijalkov+31,+Skopje+1000",
    },
    {
      id: 6,
      name: "Proteini.si Shop",
      city: "Skopje - City Mall",
      address: "Skopje City Mall, Ljubljanska 4, Skopje 1000",
      phone: "+389 71 399 036",
      email: "makedonija@proteini.si",
      workingHours: {
        monFri: "10:00 - 22:00",
        sat: "Closed",
        sun: "Closed",
      },
      // Address from the sixth URL
      coordinates: "Ljubljanska+4,+Skopje+1000",
    },
    {
      id: 7,
      name: "Proteini.si Shop",
      city: "Skopje - Location 7",
      address: "42.009476, 21.370836",
      phone: "+389 71 399 036",
      email: "makedonija@proteini.si",
      workingHours: {
        monFri: "10:00 - 22:00",
        sat: "Closed",
        sun: "Closed",
      },
      // Exact coordinates from the seventh URL
      coordinates: "42.0094763,21.3708356",
    },
  ];

  // Partner locations
  const gyms = [
    {
      id: 1,
      name: "Fitness House Skopje",
      city: "Skopje",
      address: "Bul. Partizanski Odredi 15, 1000 Skopje",
      phone: "+389 2 987 6543",
      email: "info@fitnesshouse.mk",
      workingHours: {
        monFri: "07:00 - 23:00",
        sat: "08:00 - 21:00",
        sun: "08:00 - 20:00",
      },
      coordinates: "Fitness+House+Skopje",
    },
    {
      id: 2,
      name: "Gym & Fit Bitola",
      city: "Bitola",
      address: "Magnolia Square 8, 7000 Bitola",
      phone: "+389 47 987 6543",
      email: "contact@gymfit.mk",
      workingHours: {
        monFri: "08:00 - 22:00",
        sat: "09:00 - 20:00",
        sun: "09:00 - 18:00",
      },
      coordinates: "Bitola+Gym+Center",
    },
    {
      id: 3,
      name: "Ohrid Wellness Center",
      city: "Ohrid",
      address: "Metodi Patchev 22, 6000 Ohrid",
      phone: "+389 46 987 6543",
      email: "wellness@ohrid.mk",
      workingHours: {
        monFri: "08:00 - 21:00",
        sat: "09:00 - 19:00",
        sun: "10:00 - 17:00",
      },
      coordinates: "Ohrid+Wellness+Center",
    },
  ];

  useEffect(() => {
    api.getBranchLocations().then((response) => {
      const locations = response?.data || [];
      setManagedLocations(
        locations.map((location) => ({
          id: location.id,
          type: location.type,
          name: location.name,
          city: location.city,
          address: location.address,
          phone: location.phone,
          email: location.email,
          workingHours: {
            monFri: location.workingHoursMonFri,
            sat: location.workingHoursSat,
            sun: location.workingHoursSun,
          },
          coordinates: location.coordinates || location.address,
        })),
      );
    });
  }, []);

  const managedShops = managedLocations.filter((item) => item.type === "shop");
  const managedGyms = managedLocations.filter((item) => item.type === "gym");

  const currentItems =
    activeTab === "shops"
      ? managedShops.length > 0
        ? managedShops
        : shops
      : managedGyms.length > 0
        ? managedGyms
        : gyms;
  const selectedBranchData = currentItems[selectedBranch] || currentItems[0];

  // Function to get Google Maps embed URL
  const getGoogleMapsEmbedUrl = (branch) => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_EMBED_API_KEY || "";
    return `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${branch.coordinates}&zoom=15`;
  };

  const directionsUrl = new URL("https://www.google.com/maps/dir/");
  directionsUrl.searchParams.set("api", "1");
  directionsUrl.searchParams.set(
    "destination",
    selectedBranchData.coordinates.replace(/\+/g, " "),
  );

  return (
    <main className="branches-page">
      <div className="branches-inner">
        <header className="branches-heading">
          <div>
            <p className="branches-brand">PROTEINI.SI</p>
            <h1>{translate("branches")}</h1>
          </div>
          <div className="branches-tabs" aria-label={translate("ourLocations")}>
            {[
              { id: "shops", label: translate("shops"), icon: FiShoppingBag },
              { id: "gyms", label: translate("partners"), icon: FiUsers },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activeTab === id}
                onClick={() => {
                  setActiveTab(id);
                  setSelectedBranch(0);
                }}
              >
                <Icon aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </header>

        <div className="branches-layout">
          <aside className="branches-directory" aria-label={translate("ourLocations")}>
            <div className="branches-directory-heading">
              <h2>{activeTab === "shops" ? translate("ourShops") : translate("partners")}</h2>
              <span>{currentItems.length}</span>
            </div>
            <div className="branches-list">
              {currentItems.map((branch, index) => (
                <button
                  key={branch.id}
                  type="button"
                  aria-pressed={selectedBranchData.id === branch.id}
                  aria-controls="branch-details"
                  className="branches-location"
                  onClick={() => setSelectedBranch(index)}
                >
                  <FiMapPin className="branches-pin" aria-hidden="true" />
                  <span className="branches-location-copy">
                    <strong>{branch.name}</strong>
                    <span>{branch.city}</span>
                    <small>{branch.address}</small>
                  </span>
                  <FiChevronRight className="branches-chevron" aria-hidden="true" />
                </button>
              ))}
            </div>
          </aside>

          <section id="branch-details" className="branches-detail" aria-label={selectedBranchData.city}>
            <div className="branches-detail-heading">
              <div>
                <p>{selectedBranchData.city}</p>
                <h2>{selectedBranchData.name}</h2>
                <address>{selectedBranchData.address}</address>
              </div>
              <a
                href={directionsUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="branches-directions"
              >
                <FiNavigation aria-hidden="true" />
                {translate("getDirections")}
                <FiArrowUpRight aria-hidden="true" />
              </a>
            </div>

            <div className="branches-map">
              <iframe
                title={`Map of ${selectedBranchData.name}, ${selectedBranchData.city}`}
                src={getGoogleMapsEmbedUrl(selectedBranchData)}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="branches-information">
              <div className="branches-contact">
                {selectedBranchData.phone && (
                  <div className="branches-contact-row">
                    <FiPhone aria-hidden="true" />
                    <div>
                      <h3>{translate("phone")}</h3>
                      <a href={`tel:${selectedBranchData.phone.replace(/[^+\d]/g, "")}`}>
                        {selectedBranchData.phone}
                      </a>
                    </div>
                  </div>
                )}
                {selectedBranchData.email && (
                  <div className="branches-contact-row">
                    <FiMail aria-hidden="true" />
                    <div>
                      <h3>{translate("email")}</h3>
                      <a href={`mailto:${selectedBranchData.email}`}>{selectedBranchData.email}</a>
                    </div>
                  </div>
                )}
              </div>
              <div className="branches-hours">
                <h3><FiClock aria-hidden="true" />{translate("workingHours")}</h3>
                <dl>
                  {[
                    ["monFri", "mondayToFriday"],
                    ["sat", "saturday"],
                    ["sun", "sunday"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <dt>{translate(label)}</dt>
                      <dd>{selectedBranchData.workingHours[key]}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
