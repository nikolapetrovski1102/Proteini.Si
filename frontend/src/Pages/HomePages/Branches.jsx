import { useEffect, useState } from "react";
import { useLanguage } from "../translation/LanguageContext";
import { api } from "../../services/api";
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
      email: "info@proteini.mk",
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
      email: "info@proteini.mk",
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
      email: "info@proteini.mk",
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
      email: "info@proteini.mk",
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
      email: "info@proteini.mk",
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
      email: "info@proteini.mk",
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
      email: "info@proteini.mk",
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

  // Free keyless Google Maps embed (no API key / billing needed).
  // Accepts "lat,lng" or a free-text address/place name.
  const getMapEmbedUrl = (branch) => {
    const query = String(branch.coordinates || branch.address || "")
      .replace(/\+/g, " ")
      .trim();
    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;
  };

  const directionsUrl = new URL("https://www.google.com/maps/dir/");
  directionsUrl.searchParams.set("api", "1");
  directionsUrl.searchParams.set(
    "destination",
    selectedBranchData.coordinates.replace(/\+/g, " "),
  );

  const hours = [
    ["monFri", "mondayToFriday"],
    ["sat", "saturday"],
    ["sun", "sunday"],
  ].filter(([key]) => selectedBranchData.workingHours?.[key]);

  return (
    <main className="branches-page">
      <div className="branches-inner">
        <header className="branches-heading">
          <h1>{translate("branches")}</h1>
          <nav className="branches-tabs" aria-label={translate("ourLocations")}>
            {[
              { id: "shops", label: translate("shops") },
              { id: "gyms", label: translate("partners") },
            ].map(({ id, label }) => (
              <button
                key={id}
                type="button"
                aria-pressed={activeTab === id}
                onClick={() => {
                  setActiveTab(id);
                  setSelectedBranch(0);
                }}
              >
                {label}
              </button>
            ))}
          </nav>
        </header>

        <div className="branches-layout">
          <ul className="branches-list" aria-label={translate("ourLocations")}>
            {currentItems.map((branch, index) => (
              <li key={branch.id}>
                <button
                  type="button"
                  aria-pressed={selectedBranchData.id === branch.id}
                  aria-controls="branch-details"
                  className="branches-location"
                  onClick={() => setSelectedBranch(index)}
                >
                  <strong>{branch.name}</strong>
                  <span>{branch.city}</span>
                </button>
              </li>
            ))}
          </ul>

          <section id="branch-details" className="branches-detail" aria-live="polite">
            <div className="branches-detail-heading">
              <div>
                <h2>{selectedBranchData.name}</h2>
                <address>
                  {selectedBranchData.address}
                  {selectedBranchData.city && selectedBranchData.address !== selectedBranchData.city
                    ? `, ${selectedBranchData.city}`
                    : ""}
                </address>
              </div>
              <a
                href={directionsUrl.toString()}
                target="_blank"
                rel="noopener noreferrer"
                className="branches-directions"
              >
                {translate("getDirections")} <span aria-hidden="true">&#8599;</span>
              </a>
            </div>

            <div className="branches-map">
              <iframe
                key={selectedBranchData.id}
                title={`Map of ${selectedBranchData.name}, ${selectedBranchData.city}`}
                src={getMapEmbedUrl(selectedBranchData)}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            <div className="branches-information">
              {(selectedBranchData.phone || selectedBranchData.email) && (
                <div>
                  <h3>{translate("contact")}</h3>
                  <dl>
                    {selectedBranchData.phone && (
                      <div>
                        <dt>{translate("phone")}</dt>
                        <dd>
                          <a href={`tel:${selectedBranchData.phone.replace(/[^+\d]/g, "")}`}>
                            {selectedBranchData.phone}
                          </a>
                        </dd>
                      </div>
                    )}
                    {selectedBranchData.email && (
                      <div>
                        <dt>{translate("email")}</dt>
                        <dd>
                          <a href={`mailto:${selectedBranchData.email}`}>{selectedBranchData.email}</a>
                        </dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
              {hours.length > 0 && (
                <div>
                  <h3>{translate("workingHours")}</h3>
                  <dl>
                    {hours.map(([key, label]) => (
                      <div key={key}>
                        <dt>{translate(label)}</dt>
                        <dd className="branches-num">{selectedBranchData.workingHours[key]}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
